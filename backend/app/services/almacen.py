from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.almacen import AlmacenIn, AlmacenOut

# CRUD ALMACEN 

async def get_all_almacenes() -> (
    List[AlmacenOut]
):  # GET - Trae a todos los almacenes de la BD
    query = "SELECT * FROM almacenes"
    rows = await db.fetch_all(query=query)
    return rows


async def get_almacen_by_id(
    id: int,
) -> AlmacenOut:  # GET - Trae al almacen con el id indicado
    query = "SELECT * FROM almacenes WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Almacen no encontrado")
    return row


async def create_almacen(almacen: AlmacenIn) -> AlmacenOut:  # POST - Crea un usuario
    query = """
        INSERT INTO almacenes (nombre, ubicacion, capacidad_maxima, activo, fecha_creacion)
        VALUES (:nombre, :ubicacion, :capacidad_maxima, :activo, :fecha_creacion)
    """
    last_record_id = await db.execute(query=query, values=almacen.dict())
    return {
        "id": last_record_id,
        **almacen.dict(),
    }


async def update_almacen(
    almacen_id: int, almacen: AlmacenIn
) -> AlmacenOut:  # PUT - Modifica el almacen con el id indicado
    query = """
        UPDATE almacenes
        SET nombre = :nombre,
            email = :email,
            password_hash = :password_hash,
            rol = :rol,
            activo = :activo,
            fecha_creacion = :fecha_creacion,
            fecha_ultima_sesion = :fecha_ultima_sesion
        WHERE id = :id
    """
    values = {**almacen.dict(), "id": almacen_id}
    await db.execute(query=query, values=values)
    return {**almacen.dict(), "id": almacen_id}


async def delete_almacen(
    id: int,
) -> dict:  # DELETE - Elimina el almacen con el id indicado
    query = "DELETE FROM almacenes WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Almacen no encontrado")
    return {"message": "Almacen eliminado correctamente"}