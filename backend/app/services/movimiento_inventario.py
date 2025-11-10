from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.movimiento_inventario import MovimientoInventarioIn, MovimientoInventarioOut


# VALIDACIONES


def validar_tipo_movimiento(tipo: str) -> str:  # Validar que el tipo de movimiento sea válido
    tipos_validos = ["entrada", "salida", "ajuste", "devolucion"]
    if tipo.lower() not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de movimiento inválido. Debe ser: {', '.join(tipos_validos)}",
        )
    return tipo.lower()


def validar_cantidad(cantidad: int) -> int:     # Validar que la cantidad sea positiva y razonable
    if cantidad <= 0:
        raise HTTPException(
            status_code=400, detail="La cantidad debe ser mayor a 0"
        )

    if cantidad > 100000:
        raise HTTPException(
            status_code=400, detail="La cantidad no puede ser mayor a 100,000 unidades"
        )

    return cantidad


async def validar_producto_existe(fk_producto: int):    # Validar que el producto existe y está activo
    query = "SELECT id, activo FROM productos WHERE id = :id"
    producto = await db.fetch_one(query, values={"id": fk_producto})

    if not producto:
        raise HTTPException(
            status_code=404, detail=f"Producto con id {fk_producto} no encontrado"
        )

    if not producto["activo"]:
        raise HTTPException(
            status_code=400, detail="El producto está inactivo"
        )


async def validar_almacen_existe(fk_almacen: int):  # Validar que el almacén existe y está activo
    query = "SELECT id, activo FROM almacenes WHERE id = :id"
    almacen = await db.fetch_one(query, values={"id": fk_almacen})

    if not almacen:
        raise HTTPException(
            status_code=404, detail=f"Almacén con id {fk_almacen} no encontrado"
        )

    if not almacen["activo"]:
        raise HTTPException(
            status_code=400, detail="El almacén está inactivo"
        )


async def validar_usuario_existe(fk_usuario: int): # Validar que el usuario existe y está activo para registrar el movimiento
    query = "SELECT id, activo FROM usuarios WHERE id = :id"
    usuario = await db.fetch_one(query, values={"id": fk_usuario})

    if not usuario:
        raise HTTPException(
            status_code=404, detail=f"Usuario con id {fk_usuario} no encontrado"
        )

    if not usuario["activo"]:
        raise HTTPException(
            status_code=400, detail="El usuario está inactivo"
        )


async def validar_proveedor_existe(fk_proveedor: int | None): # Validar que el proveedor existe y está activo si se proporciona
    if not fk_proveedor:
        return

    query = "SELECT id, activo FROM proveedores WHERE id = :id"
    proveedor = await db.fetch_one(query, values={"id": fk_proveedor})

    if not proveedor:
        raise HTTPException(
            status_code=404, detail=f"Proveedor con id {fk_proveedor} no encontrado"
        )

    if not proveedor["activo"]:
        raise HTTPException(
            status_code=400, detail="El proveedor está inactivo"
        )

async def obtener_stock_actual(fk_producto: int, fk_almacen: int) -> int: # Obtener el stock actual de un producto en un almacén
    query = """
        SELECT cantidad_disponible 
        FROM stock_almacen 
        WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
    """
    stock = await db.fetch_one(
        query, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
    )

    return stock["cantidad_disponible"] if stock else 0


async def calcular_nuevo_stock(
    cantidad_actual: int, cantidad_movimiento: int, tipo_movimiento: str
) -> int:       # Calcular el nuevo stock según el tipo de movimiento

    if tipo_movimiento == "entrada":
        return cantidad_actual + cantidad_movimiento
    elif tipo_movimiento == "salida":
        nuevo_stock = cantidad_actual - cantidad_movimiento
        if nuevo_stock < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Stock actual: {cantidad_actual}, Intentando retirar: {cantidad_movimiento}",
            )
        return nuevo_stock
    elif tipo_movimiento == "ajuste":
        if cantidad_movimiento < 0:
            raise HTTPException(
                status_code=400,
                detail="El ajuste no puede ser negativo",
            )
        return cantidad_movimiento
    elif tipo_movimiento == "devolucion":
        return cantidad_actual + cantidad_movimiento

    return cantidad_actual


async def actualizar_stock_almacen(fk_producto: int, fk_almacen: int, nuevo_stock: int):     # Actualizar el stock en la tabla stock_almacen

    try:
        query_check = """
            SELECT id FROM stock_almacen 
            WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
        """
        existe = await db.fetch_one(
            query_check, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
        )

        if existe:
            query_update = """
                UPDATE stock_almacen 
                SET cantidad_disponible = :cantidad
                WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
            """
            await db.execute(
                query_update,
                values={
                    "cantidad": nuevo_stock,
                    "fk_producto": fk_producto,
                    "fk_almacen": fk_almacen,
                },
            )
        else:
            query_insert = """
                INSERT INTO stock_almacen (fk_producto, fk_almacen, cantidad_disponible, cantidad_reservada)
                VALUES (:fk_producto, :fk_almacen, :cantidad, 0)
            """
            await db.execute(
                query_insert,
                values={
                    "fk_producto": fk_producto,
                    "fk_almacen": fk_almacen,
                    "cantidad": nuevo_stock,
                },
            )

    except Exception as e:
        print(f"Error al actualizar stock_almacen: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar el stock")


# CRUD MOVIMIENTOS INVENTARIO


async def get_all_movimientos(usuario_actual) -> List[MovimientoInventarioOut]: # GET - Trae todos los movimientos de inventario
    
    if usuario_actual["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los movimientos de inventario")
    
    try:
        query = "SELECT * FROM movimientos_inventario ORDER BY fecha_movimiento DESC"
        rows = await db.fetch_all(query=query)
        return rows

    except Exception as e:
        print(f"Error al obtener movimientos: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al obtener movimientos: {e}"
        )

async def get_movimientos_por_usuario(fk_usuario: int, usuario_actual) -> List[MovimientoInventarioOut]: # GET - Trae todos los movimientos de inventario de un usuario específico - Para que un usuario vea sus propios movimientos
   
    if usuario_actual["rol"] != "admin" and usuario_actual["id"] != fk_usuario:  # Solo admin o el mismo usuario pueden ver sus movimientos
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los movimientos de este usuario")

    try:
        query = """
            SELECT * FROM movimientos_inventario 
            WHERE fk_usuario = :fk_usuario 
            ORDER BY fecha_movimiento DESC
        """
        rows = await db.fetch_all(query=query, values={"fk_usuario": fk_usuario})
        return rows

    except Exception as e:
        print(f"Error al obtener movimientos del usuario {fk_usuario}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al obtener movimientos del usuario: {e}"
        )

async def get_movimiento_by_id(id: int) -> MovimientoInventarioOut: # GET - Trae un movimiento por id
    try:
        if id <= 0:
            raise HTTPException(status_code=400, detail="ID inválido")

        query = "SELECT * FROM movimientos_inventario WHERE id = :id"
        row = await db.fetch_one(query=query, values={"id": id})

        if not row:
            raise HTTPException(status_code=404, detail="Movimiento no encontrado")

        return row

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener movimiento: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al obtener movimiento: {e}"
        )


async def create_movimiento(
    movimiento: MovimientoInventarioIn, usuario_actual
) -> MovimientoInventarioOut:
    # POST - Crea un movimiento de inventario

    #Validar que el usuario que crea el movimiento es el mismo que el fk_usuario o es admin
    if usuario_actual["rol"] != "admin" and usuario_actual["id"] != movimiento.fk_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para crear un movimiento para otro usuario")

    # Validaciones básicas
    tipo_validado = validar_tipo_movimiento(movimiento.tipo_movimiento)
    cantidad_validada = validar_cantidad(movimiento.cantidad)
    await validar_producto_existe(movimiento.fk_producto)
    await validar_almacen_existe(movimiento.fk_almacen)
    await validar_usuario_existe(movimiento.fk_usuario)
    await validar_proveedor_existe(movimiento.fk_proveedor)

    # Validación especial: entrada con proveedor
    if tipo_validado == "entrada" and not movimiento.fk_proveedor:
        raise HTTPException(
            status_code=400,
            detail="Las entradas deben tener un proveedor asociado",
        )

    # Obtener stock actual
    stock_actual = await obtener_stock_actual(
        movimiento.fk_producto, movimiento.fk_almacen
    )

    # Calcular nuevo stock
    stock_nuevo = await calcular_nuevo_stock(
        stock_actual, cantidad_validada, tipo_validado
    )

    try:
        query = """
            INSERT INTO movimientos_inventario (
                fk_producto, fk_almacen, tipo_movimiento, cantidad,
                cantidad_anterior, cantidad_nueva, motivo, fk_usuario, fk_proveedor
            )
            VALUES (
                :fk_producto, :fk_almacen, :tipo_movimiento, :cantidad,
                :cantidad_anterior, :cantidad_nueva, :motivo, :fk_usuario, :fk_proveedor
            )
        """

        movimiento_id = await db.execute(
            query=query,
            values={
                "fk_producto": movimiento.fk_producto,
                "fk_almacen": movimiento.fk_almacen,
                "tipo_movimiento": tipo_validado,
                "cantidad": cantidad_validada,
                "cantidad_anterior": stock_actual,
                "cantidad_nueva": stock_nuevo,
                "motivo": movimiento.motivo,
                "fk_usuario": movimiento.fk_usuario,
                "fk_proveedor": movimiento.fk_proveedor,
            },
        )

        # Actualizar stock en stock_almacen
        await actualizar_stock_almacen(
            movimiento.fk_producto, movimiento.fk_almacen, stock_nuevo
        )

        return await get_movimiento_by_id(movimiento_id)

    except Exception as e:
        print(f"Error al crear movimiento: {e}")
        raise HTTPException(
            status_code=500, detail="Error al crear el movimiento. Intente nuevamente."
        )

