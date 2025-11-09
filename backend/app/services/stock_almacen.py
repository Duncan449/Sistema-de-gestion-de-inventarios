from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.stock_almacen import Stock_AlmacenIn, Stock_AlmacenOut

# CRUD STOCK_ALMACEN 

async def get_all_stock_almacenes() -> List[Stock_AlmacenOut]:  # OBTENER el stock de todos los productos de todos y cada uno de los almacenes
    try: 
        query = "SELECT * FROM stock_almacen"
        rows = await db.fetch_all(query=query)
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener stock: {e}")


async def get_stock_almacen_by_id(id: int) -> Stock_AlmacenOut:  # OBTENER el stock de un producto de un almacen
    try:
        if id <= 0:  # Validar IDs negativos o cero
            raise HTTPException(status_code=400, detail="ID inválido")
        
        query = "SELECT * FROM stock_almacen WHERE id = :id"
        row = await db.fetch_one(query=query, values={"id": id})
        if not row:
            raise HTTPException(status_code=404, detail="Stock no encontrado")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener stock: {e}")

    # ACÁ PODEMOS Implementar al menos cuatro consultas SQL que incluyan, de manera alternada:
    # o INNER JOIN
    # o Subconsultas (Subqueries)
    # o Agrupamientos con GROUP BY

    # Ejemplo de INNER JOIN
async def get_stock_con_producto(producto_id: int) -> List[Stock_AlmacenOut]:  # OBTENER el stock de un producto específico junto con su nombre
    query = """
        SELECT sa.*, p.nombre AS nombre_producto
        FROM stock_almacen sa
        INNER JOIN productos p ON sa.fk_producto = p.id
        WHERE p.id = :producto_id
    """
    rows = await db.fetch_all(query=query, values={"producto_id": producto_id})
    return rows

    # Ejemplo de Subconsulta
async def get_stock_minimo_por_almacen(almacen_id: int) -> List[Stock_AlmacenOut]:  # OBTENER el stock de productos en un almacén que estén por debajo del stock mínimo definido en la tabla productos
    query = """
        SELECT *
        FROM stock_almacen
        WHERE fk_almacen = :almacen_id
        AND cantidad_disponible < (SELECT stock_minimo FROM productos WHERE id = fk_producto)
    """
    rows = await db.fetch_all(query=query, values={"almacen_id": almacen_id})
    return rows

    # Ejemplo de Agrupamiento con GROUP BY
async def get_stock_por_producto() -> List[Stock_AlmacenOut]:   # OBTENER la cantidad total disponible por producto en todos los almacenes
    query = """
        SELECT fk_producto, SUM(cantidad_disponible) AS total_disponible
        FROM stock_almacen
        GROUP BY fk_producto
    """
    rows = await db.fetch_all(query=query)
    return rows

async def get_stock_por_almacen(almacen_id: int) -> List[Stock_AlmacenOut]:  # OBTENER la cantidad total disponible por almacén
    query = """
        SELECT fk_almacen, SUM(cantidad_disponible) AS total_disponible
        FROM stock_almacen
        WHERE fk_almacen = :almacen_id
        GROUP BY fk_almacen
    """
    rows = await db.fetch_all(query=query, values={"almacen_id": almacen_id})
    return rows


async def create_stock_almacen(stock_almacen: Stock_AlmacenIn) -> Stock_AlmacenOut:  # CREAR un nuevo registro en la tabla stock_almacen
    try:
        if stock_almacen.cantidad_disponible < 0:
            raise HTTPException(status_code=400, detail="La cantidad disponible no puede ser negativa")  # Validar que la cantidad no sea menor a 0 

        if stock_almacen.cantidad_reservada < 0:
            raise HTTPException(status_code=400, detail="La cantidad reservada no puede ser negativa")
        
        if stock_almacen.cantidad_reservada >= stock_almacen.cantidad_disponible:
            raise HTTPException(status_code=400, detail="La cantidad reservada no puede ser mayor a la cantidad disponible")  # Validar que la cantidad no sea mayor a la reservada
        
        # Obtener stock mínimo del producto
        producto_query = "SELECT stock_minimo FROM productos WHERE id = :id"
        producto = await db.fetch_one(producto_query, values={"id": stock_almacen.fk_producto})
        
        if producto and producto["stock_minimo"] is not None:
            if stock_almacen.cantidad_disponible < producto["stock_minimo"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"La cantidad disponible ({stock_almacen.cantidad_disponible}) es menor al stock mínimo requerido ({producto['stock_minimo']}) para este producto"
                )
        
        # Obtener capacidad del almacén
        almacen_query = "SELECT capacidad_maxima FROM almacenes WHERE id = :id"
        almacen = await db.fetch_one(almacen_query, values={"id": stock_almacen.fk_almacen})
        if almacen:
            cantidad_total = stock_almacen.cantidad_disponible + stock_almacen.cantidad_reservada
            if cantidad_total > almacen["capacidad_maxima"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"La cantidad total ({cantidad_total}) excede la capacidad máxima del almacén ({almacen['capacidad_maxima']})"
                )
        
        query = """
            INSERT INTO stock_almacen (fk_producto, fk_almacen, cantidad_disponible, cantidad_reservada)
            VALUES (:fk_producto, :fk_almacen, :cantidad_disponible, :cantidad_reservada)
        """
        last_record_id = await db.execute(query=query, values=stock_almacen.dict())  # Crea y retorna el nuevo stock_almacén
        return await get_stock_almacen_by_id(last_record_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear stock_almacen: {e}")  


async def update_stock_almacen(stock_almacen_id: int, stock_almacen: Stock_AlmacenIn) -> Stock_AlmacenOut:  # ACTUALIZAR un registro de stock_almacen
    try:
        if stock_almacen_id <= 0:  # Validar IDs negativos o cero
            raise HTTPException(status_code=400, detail="ID inválido")
        
        # Validar cambios de FK en UPDATE (evitar duplicados)
        current_query = "SELECT fk_producto, fk_almacen FROM stock_almacen WHERE id = :id"
        current = await db.fetch_one(current_query, values={"id": stock_almacen_id})
        
        if (stock_almacen.fk_producto != current["fk_producto"] or  # Si cambió el producto o el almacén, verificar que no exista la nueva combinación
            stock_almacen.fk_almacen != current["fk_almacen"]):
            
            check_query = """
                SELECT id FROM stock_almacen 
                WHERE fk_producto = :fk_producto 
                AND fk_almacen = :fk_almacen 
                AND id != :current_id
            """
            existing = await db.fetch_one(check_query, values={
                "fk_producto": stock_almacen.fk_producto,
                "fk_almacen": stock_almacen.fk_almacen,
                "current_id": stock_almacen_id
            })
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Ya existe un registro de stock para el producto {stock_almacen.fk_producto} en el almacén {stock_almacen.fk_almacen}"
                )
        
        if stock_almacen.cantidad_disponible < 0:
            raise HTTPException(status_code=400, detail="La cantidad disponible no puede ser negativa")  # Validar que la cantidad no sea menor a 0 

        if stock_almacen.cantidad_reservada < 0:
            raise HTTPException(status_code=400, detail="La cantidad reservada no puede ser negativa") 
        
        if stock_almacen.cantidad_reservada > stock_almacen.cantidad_disponible:
            raise HTTPException(status_code=400, detail="La cantidad reservada no puede ser mayor a la cantidad disponible")  # Validar que la cantidad no sea mayor a la reservada
        
        # # Obtener stock mínimo del producto
        # producto_query = "SELECT stock_minimo FROM productos WHERE id = :id"
        # producto = await db.fetch_one(producto_query, values={"id": stock_almacen.fk_producto})
        
        # if producto and producto["stock_minimo"] is not None:
        #     if stock_almacen.cantidad_disponible < producto["stock_minimo"]:
        #         raise HTTPException(
        #             status_code=400, 
        #             detail=f"La cantidad disponible ({stock_almacen.cantidad_disponible}) es menor al stock mínimo requerido ({producto['stock_minimo']}) para este producto"
        #         )
            
        # Obtener capacidad del almacén
        almacen_query = "SELECT capacidad_maxima FROM almacenes WHERE id = :id"
        almacen = await db.fetch_one(almacen_query, values={"id": stock_almacen.fk_almacen})
        if almacen:
            cantidad_total = stock_almacen.cantidad_disponible + stock_almacen.cantidad_reservada
            if cantidad_total > almacen["capacidad_maxima"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"La cantidad total ({cantidad_total}) excede la capacidad máxima del almacén ({almacen['capacidad_maxima']})"
                )
        
        revision_query = "SELECT id FROM stock_almacen WHERE id = :id"
        existing = await db.fetch_one(revision_query, values={"id": stock_almacen_id})
        if not existing:
            raise HTTPException(
                status_code=404, detail=f"Stock_almacen con id {stock_almacen_id} no encontrado"
            )
        query = """
            UPDATE stock_almacen
            SET fk_producto = :fk_producto,
                fk_almacen = :fk_almacen,
                cantidad_disponible = :cantidad_disponible,
                cantidad_reservada = :cantidad_reservada
            WHERE id = :id
        """
        values = {**stock_almacen.dict(), "id": stock_almacen_id}
        await db.execute(query=query, values=values)
        return await get_stock_almacen_by_id(stock_almacen_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar stock_almacen: {e}")


async def delete_stock_almacen(id: int) -> dict:  # ELIMINAR un registro de stock_almacen
    try:
        if id <= 0:  # Validar IDs negativos o cero
            raise HTTPException(status_code=400, detail="ID inválido")
        
        # No permitir eliminar si hay stock disponible
        check_query = "SELECT cantidad_disponible, cantidad_reservada FROM stock_almacen WHERE id = :id"
        stock = await db.fetch_one(check_query, values={"id": id})
        if not stock:
            raise HTTPException(status_code=404, detail="Stock_almacen no encontrado")
        
        if stock["cantidad_disponible"] > 0 or stock["cantidad_reservada"] > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"No se puede eliminar. Stock disponible: {stock['cantidad_disponible']}, reservado: {stock['cantidad_reservada']}"
            )
        
        query = "DELETE FROM stock_almacen WHERE id = :id"
        result = await db.execute(query=query, values={"id": id})
        if not result:
            raise HTTPException(status_code=404, detail="Stock_almacen no encontrado")
        return {"message": "Stock_almacen eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar stock_almacen: {e}")