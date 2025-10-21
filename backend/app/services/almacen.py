from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.almacen import AlmacenIn, AlmacenOut

# CRUD ALMACEN 

async def get_all_almacenes() -> List[AlmacenOut]:  # Obtener todos los almacenes
    try: 
        query = "SELECT * FROM almacenes"
        rows = await db.fetch_all(query=query)
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener almacenes: {e}")


async def get_almacen_by_id(id: int) -> AlmacenOut:  # Obtener los almacenes por id
    try:
        if id <= 0:  # Validar IDs negativos o cero
            raise HTTPException(status_code=400, detail="ID inválido")
        
        query = "SELECT * FROM almacenes WHERE id = :id"
        row = await db.fetch_one(query=query, values={"id": id})
        if not row:
            raise HTTPException(status_code=404, detail="Almacen no encontrado")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener almacen: {e}")


async def create_almacen(almacen: AlmacenIn) -> AlmacenOut:  # Crear un nuevo almacen
    try:
        if not almacen.nombre.strip():
            raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")  # Validar que el nombre no esté vacío
        if not almacen.ubicacion.strip():
            raise HTTPException(status_code=400, detail="La ubicación no puede estar vacía")  # Validar que la ubicación no esté vacía
        if almacen.capacidad_maxima <= 0:  # Validar que la capacidad no sea menor o igual a 0
            raise HTTPException(status_code=400, detail="La capacidad máxima debe ser mayor a 0")
        
        query = """
            INSERT INTO almacenes (nombre, ubicacion, capacidad_maxima, activo)
            VALUES (:nombre, :ubicacion, :capacidad_maxima, :activo)
        """
        last_record_id = await db.execute(query=query, values=almacen.dict())  # Crea y retorna el nuevo almacén
        return await get_almacen_by_id(last_record_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear almacen: {e}")  


async def update_almacen(almacen_id: int, almacen: AlmacenIn) -> AlmacenOut:  # Actualizar un almacen
    try:
        if almacen.capacidad_maxima <= 0:
            raise HTTPException(status_code=400, detail="La capacidad máxima debe ser mayor a 0")  # Validar que la capacidad no sea menor o igual a 0
        
        revision_query = "SELECT id FROM almacenes WHERE id = :id"
        existing = await db.fetch_one(revision_query, values={"id": almacen_id})
        if not existing:
            raise HTTPException(
                status_code=404, detail=f"Almacen con id {almacen_id} no encontrado"
            )
        query = """
            UPDATE almacenes
            SET nombre = :nombre,
                ubicacion = :ubicacion,
                capacidad_maxima = :capacidad_maxima,
                activo = :activo
            WHERE id = :id
        """
        values = {**almacen.dict(), "id": almacen_id}
        await db.execute(query=query, values=values)
        return await get_almacen_by_id(almacen_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar almacen: {e}")


async def delete_almacen(id: int) -> dict:  # Eliminar un almacen
    try:
        query = "DELETE FROM almacenes WHERE id = :id"
        result = await db.execute(query=query, values={"id": id})
        if not result:
            raise HTTPException(status_code=404, detail="Almacen no encontrado")
        return {"message": "Almacen eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar almacen: {e}")