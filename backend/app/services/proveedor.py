# backend/app/services/proveedor.py
from typing import List
from fastapi import HTTPException, status
from app.config.database import db
from app.schemas.proveedor import ProveedorIn, ProveedorOut


async def get_all_proveedores() -> List[ProveedorOut]:
    """GET - Trae a todos los proveedores de la BD"""
    try:
        query = "SELECT * FROM proveedores ORDER BY nombre"
        rows = await db.fetch_all(query=query)
        return rows
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener proveedores: {str(e)}"
        )


async def get_proveedor_by_id(id: int) -> ProveedorOut:
    """GET - Trae al proveedor con el id indicado"""
    if id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID debe ser un número positivo"
        )
    
    try:
        query = "SELECT * FROM proveedores WHERE id = :id"
        row = await db.fetch_one(query=query, values={"id": id})
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Proveedor con ID {id} no encontrado"
            )
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener proveedor: {str(e)}"
        )


async def create_proveedor(proveedor: ProveedorIn) -> ProveedorOut:
    """POST - Crea un proveedor"""
    
    # ✅ Validar que no exista un proveedor con el mismo nombre
    query_check = "SELECT id FROM proveedores WHERE LOWER(nombre) = LOWER(:nombre)"
    existing = await db.fetch_one(query_check, values={"nombre": proveedor.nombre})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un proveedor con el nombre '{proveedor.nombre}'"
        )
    
    # ✅ Si tiene email, validar que no esté duplicado
    if proveedor.email:
        query_email = "SELECT id FROM proveedores WHERE LOWER(email) = LOWER(:email)"
        existing_email = await db.fetch_one(query_email, values={"email": proveedor.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un proveedor con el email '{proveedor.email}'"
            )
    
    # ✅ Si tiene teléfono, validar que no esté duplicado
    if proveedor.telefono:
        query_telefono = "SELECT id, nombre FROM proveedores WHERE telefono = :telefono"
        existing_telefono = await db.fetch_one(query_telefono, values={"telefono": proveedor.telefono})
        if existing_telefono:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El teléfono '{proveedor.telefono}' ya está registrado para el proveedor '{existing_telefono['nombre']}'"
            )
    
    try:
        query = """
            INSERT INTO proveedores (nombre, telefono, email, direccion, ciudad, activo)
            VALUES (:nombre, :telefono, :email, :direccion, :ciudad, :activo)
        """
        last_record_id = await db.execute(query=query, values=proveedor.dict())
        return {
            "id": last_record_id,
            **proveedor.dict(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear proveedor: {str(e)}"
        )


async def update_proveedor(proveedor_id: int, proveedor: ProveedorIn) -> ProveedorOut:
    """PUT - Modifica el proveedor con el id indicado"""
    
    # ✅ Validar que el ID sea positivo
    if proveedor_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID debe ser un número positivo"
        )
    
    # ✅ Verificar que el proveedor existe
    query_exists = "SELECT id FROM proveedores WHERE id = :id"
    exists = await db.fetch_one(query_exists, values={"id": proveedor_id})
    if not exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {proveedor_id} no encontrado"
        )
    
    # ✅ Validar nombre duplicado (excepto el mismo proveedor)
    query_nombre = "SELECT id FROM proveedores WHERE LOWER(nombre) = LOWER(:nombre) AND id != :id"
    existing_nombre = await db.fetch_one(
        query_nombre, 
        values={"nombre": proveedor.nombre, "id": proveedor_id}
    )
    if existing_nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otro proveedor con el nombre '{proveedor.nombre}'"
        )
    
    # ✅ Validar email duplicado si se proporciona (excepto el mismo proveedor)
    if proveedor.email:
        query_email = "SELECT id FROM proveedores WHERE LOWER(email) = LOWER(:email) AND id != :id"
        existing_email = await db.fetch_one(
            query_email,
            values={"email": proveedor.email, "id": proveedor_id}
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro proveedor con el email '{proveedor.email}'"
            )
    
    # ✅ Validar teléfono duplicado si se proporciona (excepto el mismo proveedor)
    if proveedor.telefono:
        query_telefono = "SELECT id, nombre FROM proveedores WHERE telefono = :telefono AND id != :id"
        existing_telefono = await db.fetch_one(
            query_telefono,
            values={"telefono": proveedor.telefono, "id": proveedor_id}
        )
        if existing_telefono:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El teléfono '{proveedor.telefono}' ya está registrado para el proveedor '{existing_telefono['nombre']}'"
            )
    
    try:
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar proveedor: {str(e)}"
        )


async def delete_proveedor(id: int) -> dict:
    """DELETE - Elimina el proveedor con el id indicado"""
    
    # ✅ Validar ID positivo
    if id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID debe ser un número positivo"
        )
    
    # ✅ Verificar que existe antes de eliminar
    query_exists = "SELECT id FROM proveedores WHERE id = :id"
    exists = await db.fetch_one(query_exists, values={"id": id})
    if not exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {id} no encontrado"
        )
    
    # ✅ Verificar si tiene productos asociados (restricción de FK)
    # query_productos = "SELECT COUNT(*) as total FROM productos WHERE proveedor_id = :id"
    # productos = await db.fetch_one(query_productos, values={"id": id})
    # if productos and productos['total'] > 0:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"No se puede eliminar el proveedor porque tiene {productos['total']} producto(s) asociado(s)"
    #     )
    
    try:
        query = "DELETE FROM proveedores WHERE id = :id"
        await db.execute(query=query, values={"id": id})
        return {"message": f"Proveedor con ID {id} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar proveedor: {str(e)}"
        )