from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.proveedor import ProveedorIn, ProveedorOut


# CRUD PROVEEDORES


async def get_all_proveedores() -> List[ProveedorOut]:
    query = "SELECT * FROM proveedores"
    rows = await db.fetch_all(query=query)
    return rows


async def get_proveedor_by_id(id: int) -> ProveedorOut:
    query = "SELECT * FROM proveedores WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return row


async def create_proveedor(proveedor: ProveedorIn) -> ProveedorOut:
    query = """
        INSERT INTO proveedores (nombre, telefono, email, direccion, ciudad, activo)
        VALUES (:nombre, :telefono, :email, :direccion, :ciudad, :activo)
    """
    last_record_id = await db.execute(query=query, values=proveedor.dict())
    return {
        "id": last_record_id,
        **proveedor.dict(),
    }


async def update_proveedor(proveedor_id: int, proveedor: ProveedorIn) -> ProveedorOut:
    query = """
        UPDATE proveedores
        SET nombre = :nombre,
            telefono = :telefono,
            email = :email,
            direccion = :direccion,
            ciudad = :ciudad,
            activo = :activo
        WHERE id = :id
    """
    values = {**proveedor.dict(), "id": proveedor_id}
    await db.execute(query=query, values=values)
    return {**proveedor.dict(), "id": proveedor_id}


async def delete_proveedor(id: int) -> dict:
    query = "DELETE FROM proveedores WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return {"message": "Proveedor eliminado correctamente"}