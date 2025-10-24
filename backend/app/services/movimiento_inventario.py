from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.movimiento_inventario import MovimientoInventarioIn, MovimientoInventarioOut


# VALIDACIONES


def validar_tipo_movimiento(tipo: str) -> str:
    """Validar que el tipo de movimiento sea válido"""
    tipos_validos = ["entrada", "salida", "ajuste", "devolucion"]
    if tipo.lower() not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de movimiento inválido. Debe ser: {', '.join(tipos_validos)}",
        )
    return tipo.lower()


def validar_cantidad(cantidad: int) -> int:
    """Validar que la cantidad sea válida"""
    if cantidad <= 0:
        raise HTTPException(
            status_code=400, detail="La cantidad debe ser mayor a 0"
        )

    if cantidad > 100000:
        raise HTTPException(
            status_code=400, detail="La cantidad no puede ser mayor a 100,000 unidades"
        )

    return cantidad


async def validar_producto_existe(fk_producto: int):
    """Validar que el producto existe y está activo"""
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


async def validar_almacen_existe(fk_almacen: int):
    """Validar que el almacén existe y está activo"""
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


async def validar_usuario_existe(fk_usuario: int):
    """Validar que el usuario existe y está activo"""
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


async def validar_proveedor_existe(fk_proveedor: int | None):
    """Validar que el proveedor existe si se proporciona"""
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


async def obtener_stock_actual(fk_producto: int, fk_almacen: int) -> int:
    """Obtener el stock actual de un producto en un almacén"""
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
) -> int:
    """Calcular el nuevo stock según el tipo de movimiento"""
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
        return cantidad_movimiento
    elif tipo_movimiento == "devolucion":
        return cantidad_actual + cantidad_movimiento

    return cantidad_actual


async def actualizar_stock_almacen(fk_producto: int, fk_almacen: int, nuevo_stock: int):
    """Actualizar o crear el registro de stock en stock_almacen"""
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


# CRUD MOVIMIENTOS INVENTARIO


async def get_all_movimientos() -> List[MovimientoInventarioOut]:
    """GET - Trae todos los movimientos de inventario"""
    try:
        query = "SELECT * FROM movimientos_inventario ORDER BY fecha_movimiento DESC"
        rows = await db.fetch_all(query=query)
        
        # Mapear los nombres de la BD a los del schema
        movimientos = []
        for row in rows:
            mov_dict = dict(row)
            # Mapear fk_producto -> fk_producto, etc.
            movimientos.append(MovimientoInventarioOut(
                id=mov_dict["id"],
                fk_producto=mov_dict["fk_producto"],
                fk_almacen=mov_dict["fk_almacen"],
                tipo_movimiento=mov_dict["tipo_movimiento"],
                cantidad=mov_dict["cantidad"],
                cantidad_anterior=mov_dict["cantidad_anterior"],
                cantidad_nueva=mov_dict["cantidad_nueva"],
                motivo=mov_dict.get("motivo"),
                fk_usuario=mov_dict["fk_usuario"],
                fk_proveedor=mov_dict.get("fk_proveedor"),
                fecha_movimiento=mov_dict.get("fecha_movimiento")
            ))
        
        return movimientos

    except Exception as e:
        print(f"Error al obtener movimientos: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al obtener movimientos: {e}"
        )


async def get_movimiento_by_id(id: int) -> MovimientoInventarioOut:
    """GET - Trae un movimiento por id"""
    try:
        if id <= 0:
            raise HTTPException(status_code=400, detail="ID inválido")

        query = "SELECT * FROM movimientos_inventario WHERE id = :id"
        row = await db.fetch_one(query=query, values={"id": id})

        if not row:
            raise HTTPException(status_code=404, detail="Movimiento no encontrado")

        # Mapear los nombres de la BD a los del schema
        mov_dict = dict(row)
        return MovimientoInventarioOut(
            id=mov_dict["id"],
            fk_producto=mov_dict["fk_producto"],
            fk_almacen=mov_dict["fk_almacen"],
            tipo_movimiento=mov_dict["tipo_movimiento"],
            cantidad=mov_dict["cantidad"],
            cantidad_anterior=mov_dict["cantidad_anterior"],
            cantidad_nueva=mov_dict["cantidad_nueva"],
            motivo=mov_dict.get("motivo"),
            fk_usuario=mov_dict["fk_usuario"],
            fk_proveedor=mov_dict.get("fk_proveedor"),
            fecha_movimiento=mov_dict.get("fecha_movimiento")
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener movimiento: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al obtener movimiento: {e}"
        )


async def create_movimiento(
    movimiento: MovimientoInventarioIn,
) -> MovimientoInventarioOut:
    """POST - Crea un movimiento de inventario"""
    try:
        # Validaciones
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

        # Insertar movimiento (usando los nombres de columna de la BD)
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

        # Actualizar stock
        await actualizar_stock_almacen(
            movimiento.fk_producto, movimiento.fk_almacen, stock_nuevo
        )

        return await get_movimiento_by_id(movimiento_id)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al crear movimiento: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al crear movimiento: {str(e)}"
        )


async def delete_movimiento(id: int) -> dict:
    """DELETE - Elimina un movimiento (NO RECOMENDADO)"""
    raise HTTPException(
        status_code=400,
        detail="No se permite eliminar movimientos de inventario. Use un ajuste para corregir.",
    )

# from typing import List
# from fastapi import HTTPException
# from app.config.database import db
# from app.schemas.movimiento_inventario import MovimientoInventarioIn, MovimientoInventarioOut


# # VALIDACIONES


# def validar_tipo_movimiento(tipo: str) -> str:
#     """Validar que el tipo de movimiento sea válido"""
#     tipos_validos = ["entrada", "salida", "ajuste", "devolucion"]
#     if tipo.lower() not in tipos_validos:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Tipo de movimiento inválido. Debe ser: {', '.join(tipos_validos)}",
#         )
#     return tipo.lower()


# def validar_cantidad(cantidad: int) -> int:
#     """Validar que la cantidad sea válida"""
#     if cantidad <= 0:
#         raise HTTPException(
#             status_code=400, detail="La cantidad debe ser mayor a 0"
#         )

#     if cantidad > 100000:
#         raise HTTPException(
#             status_code=400, detail="La cantidad no puede ser mayor a 100,000 unidades"
#         )

#     return cantidad


# async def validar_producto_existe(fk_producto: int):
#     """Validar que el producto existe y está activo"""
#     query = "SELECT id, activo FROM productos WHERE id = :id"
#     producto = await db.fetch_one(query, values={"id": fk_producto})

#     if not producto:
#         raise HTTPException(
#             status_code=404, detail=f"Producto con id {fk_producto} no encontrado"
#         )

#     if not producto["activo"]:
#         raise HTTPException(
#             status_code=400, detail="El producto está inactivo"
#         )


# async def validar_almacen_existe(fk_almacen: int):
#     """Validar que el almacén existe y está activo"""
#     query = "SELECT id, activo FROM almacenes WHERE id = :id"
#     almacen = await db.fetch_one(query, values={"id": fk_almacen})

#     if not almacen:
#         raise HTTPException(
#             status_code=404, detail=f"Almacén con id {fk_almacen} no encontrado"
#         )

#     if not almacen["activo"]:
#         raise HTTPException(
#             status_code=400, detail="El almacén está inactivo"
#         )


# async def validar_usuario_existe(fk_usuario: int):
#     """Validar que el usuario existe y está activo"""
#     query = "SELECT id, activo FROM usuarios WHERE id = :id"
#     usuario = await db.fetch_one(query, values={"id": fk_usuario})

#     if not usuario:
#         raise HTTPException(
#             status_code=404, detail=f"Usuario con id {fk_usuario} no encontrado"
#         )

#     if not usuario["activo"]:
#         raise HTTPException(
#             status_code=400, detail="El usuario está inactivo"
#         )


# async def validar_proveedor_existe(fk_proveedor: int | None):
#     """Validar que el proveedor existe si se proporciona"""
#     if not fk_proveedor:
#         return

#     query = "SELECT id, activo FROM proveedores WHERE id = :id"
#     proveedor = await db.fetch_one(query, values={"id": fk_proveedor})

#     if not proveedor:
#         raise HTTPException(
#             status_code=404, detail=f"Proveedor con id {fk_proveedor} no encontrado"
#         )

#     if not proveedor["activo"]:
#         raise HTTPException(
#             status_code=400, detail="El proveedor está inactivo"
#         )


# async def obtener_stock_actual(fk_producto: int, fk_almacen: int) -> int:
#     """Obtener el stock actual de un producto en un almacén"""
#     query = """
#         SELECT cantidad_disponible 
#         FROM stock_almacen 
#         WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#     """
#     stock = await db.fetch_one(
#         query, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
#     )

#     return stock["cantidad_disponible"] if stock else 0


# async def calcular_nuevo_stock(
#     cantidad_actual: int, cantidad_movimiento: int, tipo_movimiento: str
# ) -> int:
#     """Calcular el nuevo stock según el tipo de movimiento"""
#     if tipo_movimiento == "entrada":
#         return cantidad_actual + cantidad_movimiento
#     elif tipo_movimiento == "salida":
#         nuevo_stock = cantidad_actual - cantidad_movimiento
#         if nuevo_stock < 0:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Stock insuficiente. Stock actual: {cantidad_actual}, Intentando retirar: {cantidad_movimiento}",
#             )
#         return nuevo_stock
#     elif tipo_movimiento == "ajuste":
#         return cantidad_movimiento
#     elif tipo_movimiento == "devolucion":
#         return cantidad_actual + cantidad_movimiento

#     return cantidad_actual


# async def actualizar_stock_almacen(fk_producto: int, fk_almacen: int, nuevo_stock: int):
#     """Actualizar o crear el registro de stock en stock_almacen"""
#     query_check = """
#         SELECT id FROM stock_almacen 
#         WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#     """
#     existe = await db.fetch_one(
#         query_check, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
#     )

#     if existe:
#         query_update = """
#             UPDATE stock_almacen 
#             SET cantidad_disponible = :cantidad
#             WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#         """
#         await db.execute(
#             query_update,
#             values={
#                 "cantidad": nuevo_stock,
#                 "fk_producto": fk_producto,
#                 "fk_almacen": fk_almacen,
#             },
#         )
#     else:
#         query_insert = """
#             INSERT INTO stock_almacen (fk_producto, fk_almacen, cantidad_disponible, cantidad_reservada)
#             VALUES (:fk_producto, :fk_almacen, :cantidad, 0)
#         """
#         await db.execute(
#             query_insert,
#             values={
#                 "fk_producto": fk_producto,
#                 "fk_almacen": fk_almacen,
#                 "cantidad": nuevo_stock,
#             },
#         )
# async def obtener_stock_actual(fk_producto: int, fk_almacen: int) -> int:
#     """Obtener el stock actual de un producto en un almacén"""
#     # ⚠️ IMPORTANTE: Usar fk_producto y fk_almacen según tu base de datos
#     query = """
#         SELECT cantidad_disponible 
#         FROM stock_almacen 
#         WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#     """
#     stock = await db.fetch_one(
#         query, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
#     )

#     return stock["cantidad_disponible"] if stock else 0


# async def calcular_nuevo_stock(
#     cantidad_actual: int, cantidad_movimiento: int, tipo_movimiento: str
# ) -> int:
#     """Calcular el nuevo stock según el tipo de movimiento"""
#     if tipo_movimiento == "entrada":
#         return cantidad_actual + cantidad_movimiento
#     elif tipo_movimiento == "salida":
#         nuevo_stock = cantidad_actual - cantidad_movimiento
#         if nuevo_stock < 0:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Stock insuficiente. Stock actual: {cantidad_actual}, Intentando retirar: {cantidad_movimiento}",
#             )
#         return nuevo_stock
#     elif tipo_movimiento == "ajuste":
#         return cantidad_movimiento
#     elif tipo_movimiento == "devolucion":
#         return cantidad_actual + cantidad_movimiento

#     return cantidad_actual


# async def actualizar_stock_almacen(fk_producto: int, fk_almacen: int, nuevo_stock: int):
#     """Actualizar o crear el registro de stock en stock_almacen"""
#     # ⚠️ IMPORTANTE: Usar fk_producto y fk_almacen según tu base de datos
#     query_check = """
#         SELECT id FROM stock_almacen 
#         WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#     """
#     existe = await db.fetch_one(
#         query_check, values={"fk_producto": fk_producto, "fk_almacen": fk_almacen}
#     )

#     if existe:
#         # Actualizar registro existente
#         query_update = """
#             UPDATE stock_almacen 
#             SET cantidad_disponible = :cantidad
#             WHERE fk_producto = :fk_producto AND fk_almacen = :fk_almacen
#         """
#         await db.execute(
#             query_update,
#             values={
#                 "cantidad": nuevo_stock,
#                 "fk_producto": fk_producto,
#                 "fk_almacen": fk_almacen,
#             },
#         )
#     else:
#         # Crear nuevo registro
#         query_insert = """
#             INSERT INTO stock_almacen (fk_producto, fk_almacen, cantidad_disponible, cantidad_reservada)
#             VALUES (:fk_producto, :fk_almacen, :cantidad, 0)
#         """
#         await db.execute(
#             query_insert,
#             values={
#                 "fk_producto": fk_producto,
#                 "fk_almacen": fk_almacen,
#                 "cantidad": nuevo_stock,
#             },
#         )


# # CRUD MOVIMIENTOS INVENTARIO


# # async def get_all_movimientos() -> List[MovimientoInventarioOut]:
# #     """GET - Trae todos los movimientos de inventario"""
# #     try:
# #         query = "SELECT * FROM movimientos_inventario ORDER BY fecha_movimiento DESC"
# #         rows = await db.fetch_all(query=query)
# #         return rows
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=500, detail=f"Error al obtener movimientos: {e}"
# #        )
    
# async def get_all_movimientos() -> List[MovimientoInventarioOut]:
#     """GET - Trae todos los movimientos de inventario"""
#     try:
#         query = "SELECT * FROM movimientos_inventario ORDER BY fecha_movimiento DESC"
#         rows = await db.fetch_all(query=query)

#         # 🔍 Ver en consola qué devuelve la base (solo para pruebas)
#         print([dict(r) for r in rows])

#         # ✅ Convertir los registros al modelo Pydantic
#         movimientos = [MovimientoInventarioOut(**dict(r)) for r in rows]

#         return movimientos

#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Error al obtener movimientos: {e}"
#         )



# # async def get_movimiento_by_id(id: int) -> MovimientoInventarioOut:
# #     """GET - Trae un movimiento por id"""
# #     try:
# #         if id <= 0:
# #             raise HTTPException(status_code=400, detail="ID inválido")

# #         query = "SELECT * FROM movimientos_inventario WHERE id = :id"
# #         row = await db.fetch_one(query=query, values={"id": id})

# #         if not row:
# #             raise HTTPException(status_code=404, detail="Movimiento no encontrado")

# #         return row
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=500, detail=f"Error al obtener movimiento: {e}"
# #         )
# async def get_movimiento_by_id(id: int) -> MovimientoInventarioOut:
#     """GET - Trae un movimiento por id"""
#     try:
#         if id <= 0:
#             raise HTTPException(status_code=400, detail="ID inválido")

#         query = "SELECT * FROM movimientos_inventario WHERE id = :id"
#         row = await db.fetch_one(query=query, values={"id": id})

#         if not row:
#             raise HTTPException(status_code=404, detail="Movimiento no encontrado")

#         # ✅ Convertir a modelo Pydantic
#         return MovimientoInventarioOut(**dict(row))

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Error al obtener movimiento: {e}"
#         )


# async def create_movimiento(
#     movimiento: MovimientoInventarioIn,
# ) -> MovimientoInventarioOut:
#     """POST - Crea un movimiento de inventario"""
#     try:
#         # Validaciones
#         tipo_validado = validar_tipo_movimiento(movimiento.tipo_movimiento)
#         cantidad_validada = validar_cantidad(movimiento.cantidad)

#         await validar_producto_existe(movimiento.fk_producto)
#         await validar_almacen_existe(movimiento.fk_almacen)
#         await validar_usuario_existe(movimiento.fk_usuario)
#         await validar_proveedor_existe(movimiento.fk_proveedor)

#         # Validación especial: entrada con proveedor
#         if tipo_validado == "entrada" and not movimiento.fk_proveedor:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Las entradas deben tener un proveedor asociado",
#             )

#         # Obtener stock actual
#         stock_actual = await obtener_stock_actual(
#             movimiento.fk_producto, movimiento.fk_almacen
#         )

#         # Calcular nuevo stock
#         stock_nuevo = await calcular_nuevo_stock(
#             stock_actual, cantidad_validada, tipo_validado
#         )

#         # Insertar movimiento
#         query = """
#             INSERT INTO movimientos_inventario (
#                 fk_producto, fk_almacen, tipo_movimiento, cantidad,
#                 cantidad_anterior, cantidad_nueva, motivo, fk_usuario, fk_proveedor
#             )
#             VALUES (
#                 :fk_producto, :fk_almacen, :tipo_movimiento, :cantidad,
#                 :cantidad_anterior, :cantidad_nueva, :motivo, :fk_usuario, :fk_proveedor
#             )
#         """

#         movimiento_id = await db.execute(
#             query=query,
#             values={
#                 "fk_producto": movimiento.fk_producto,
#                 "fk_almacen": movimiento.fk_almacen,
#                 "tipo_movimiento": tipo_validado,
#                 "cantidad": cantidad_validada,
#                 "cantidad_anterior": stock_actual,
#                 "cantidad_nueva": stock_nuevo,
#                 "motivo": movimiento.motivo,
#                 "fk_usuario": movimiento.fk_usuario,
#                 "fk_proveedor": movimiento.fk_proveedor,
#             },
#         )

#         # Actualizar stock
#         await actualizar_stock_almacen(
#             movimiento.fk_producto, movimiento.fk_almacen, stock_nuevo
#         )

#         return await get_movimiento_by_id(movimiento_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error al crear movimiento: {e}")
#         raise HTTPException(
#             status_code=500, detail=f"Error al crear movimiento: {str(e)}"
#         )


# async def delete_movimiento(id: int) -> dict:
#     """DELETE - Elimina un movimiento (NO RECOMENDADO)"""
#     raise HTTPException(
#         status_code=400,
#         detail="No se permite eliminar movimientos de inventario. Use un ajuste para corregir.",
#     )