from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.producto import ProductoIn, ProductoOut


# VALIDACIONES


def validar_precios(precio_compra: float, precio_venta: float):
    # Los precios deben ser positivos y el de venta mayor al de compra

    if precio_compra <= 0:
        raise HTTPException(
            status_code=400, detail="El precio de compra debe ser mayor a 0"
        )

    if precio_venta <= 0:
        raise HTTPException(
            status_code=400, detail="El precio de venta debe ser mayor a 0"
        )

    if precio_venta <= precio_compra:
        raise HTTPException(
            status_code=400,
            detail="El precio de venta debe ser mayor al precio de compra",
        )


def validar_stock_minimo(stock_minimo: int):
    # El stock mínimo no puede ser negativo
    if stock_minimo < 0:
        raise HTTPException(
            status_code=400, detail="El stock mínimo no puede ser negativo"
        )


async def validar_categoria(fk_categoria: int):
    # Valida si la categoría existe
    categoria_query = "SELECT id FROM categorias WHERE id = :id AND activa = TRUE"
    categoria_existe = await db.fetch_one(categoria_query, values={"id": fk_categoria})
    if not categoria_existe:
        raise HTTPException(
            status_code=400,
            detail=f"La categoría con id {fk_categoria} no existe",
        )


async def validar_proveedor(fk_proveedor: int):
    # Valida si el proveedor existe
    proveedor_query = "SELECT id FROM proveedores WHERE id = :id AND activo = TRUE"
    proveedor_existe = await db.fetch_one(proveedor_query, values={"id": fk_proveedor})
    if not proveedor_existe:
        raise HTTPException(
            status_code=400,
            detail=f"El proveedor con id {fk_proveedor} no existe",
        )


# CRUD PRODUCTO


async def get_all_productos() -> (
    List[ProductoOut]
):  # GET - Trae a todos los productos de la BD
    query = "SELECT * FROM productos"
    rows = await db.fetch_all(query=query)
    return rows


async def get_producto_by_id(
    id: int,
) -> ProductoOut:  # GET - Trae al producto con el id indicado
    query = "SELECT * FROM productos WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return row


async def create_producto(
    producto: ProductoIn,
) -> ProductoOut:  # POST - Crea un producto

    validar_precios(producto.precio_compra, producto.precio_venta)
    validar_stock_minimo(producto.stock_minimo)
    await validar_categoria(producto.fk_categoria)
    await validar_proveedor(producto.fk_proveedor)

    revision_query = "SELECT id FROM productos WHERE codigo = :codigo"
    existe = await db.fetch_one(
        revision_query, values={"codigo": producto.codigo}
    )  # Verificación de que el producto no esté ya registrado
    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"El producto {producto.codigo} ya está registrado",
        )

    try:
        query = """
            INSERT INTO productos (codigo, nombre, descripcion, precio_compra, precio_venta, fk_categoria, fk_proveedor, stock_minimo, activo)
            VALUES (:codigo, :nombre, :descripcion, :precio_compra, :precio_venta, :fk_categoria, :fk_proveedor, :stock_minimo, :activo)
        """
        last_record_id = await db.execute(query=query, values=producto.dict())
        return await get_producto_by_id(last_record_id)

    except Exception as e:
        print(f"Error al crear el producto: {e}")
        raise HTTPException(
            status_code=500, detail="Error al crear el producto. Intente nuevamente."
        )


async def update_producto(
    producto_id: int, producto: ProductoIn
) -> ProductoOut:  # PUT - Modifica el producto con el id indicado

    validar_precios(producto.precio_compra, producto.precio_venta)
    validar_stock_minimo(producto.stock_minimo)
    await validar_categoria(producto.fk_categoria)
    await validar_proveedor(producto.fk_proveedor)

    revision_query = "SELECT id FROM productos WHERE id = :id"  # Verificación de que el producto exista
    existing = await db.fetch_one(revision_query, values={"id": producto_id})
    if not existing:
        raise HTTPException(
            status_code=404, detail=f"Producto con id {producto_id} no encontrado"
        )

    codigo_query = "SELECT id FROM productos WHERE codigo = :codigo AND id != :id"  # Para evitar ponerle el codigo de un producto ya existente
    codigo_exists = await db.fetch_one(
        codigo_query, values={"codigo": producto.codigo, "id": producto_id}
    )
    if codigo_exists:
        raise HTTPException(
            status_code=400, detail=f"Ya existe un producto llamado {producto.codigo}"
        )

    try:
        query = """
            UPDATE productos
            SET codigo = :codigo,
                nombre = :nombre,
                descripcion = :descripcion,
                precio_compra = :precio_compra,
                precio_venta = :precio_venta,
                fk_categoria = :fk_categoria,
                fk_proveedor = :fk_proveedor,
                stock_minimo = :stock_minimo,
                activo = :activo
            WHERE id = :id
        """
        values = {**producto.dict(), "id": producto_id}
        await db.execute(query=query, values=values)
        return await get_producto_by_id(producto_id)

    except Exception as e:
        print(f"Error al actualizar producto: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar el producto")


async def delete_producto(
    id: int,
) -> dict:  # DELETE - Elimina el producto con el id indicado
    revision_query = (
        "SELECT id FROM productos WHERE id = :id"  # Verifica que exista el producto
    )
    existe = await db.fetch_one(revision_query, values={"id": id})
    if not existe:
        raise HTTPException(
            status_code=404, detail=f"Producto con id {id} no encontrado"
        )

    try:
        query = "DELETE FROM productos WHERE id = :id"
        await db.execute(query=query, values={"id": id})
        return {"message": f"Producto con id {id} eliminado correctamente"}

    except Exception as e:
        print(f"Error al eliminar producto: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar el producto")
