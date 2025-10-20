from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.usuario import UsuarioIn, UsuarioOut

# CRUD USUARIOS


async def get_all_usuarios() -> (
    List[UsuarioOut]
):  # GET - Trae a todos los usuarios de la BD
    query = "SELECT * FROM usuarios"
    rows = await db.fetch_all(query=query)
    return rows


async def get_usuario_by_id(
    id: int,
) -> UsuarioOut:  # GET - Trae al usuario con el id indicado
    query = "SELECT * FROM usuarios WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return row


async def create_usuario(usuario: UsuarioIn) -> UsuarioOut:  # POST - Crea un usuario
    query = """
        INSERT INTO usuarios (nombre, email, password_hash, rol, activo, fecha_creacion, fecha_ultima_sesion)
        VALUES (:nombre, :email, :password_hash, :rol, :activo, :fecha_creacion, :fecha_ultima_sesion)
    """
    last_record_id = await db.execute(query=query, values=usuario.dict())
    return {
        "id": last_record_id,
        **usuario.dict(),
    }


async def update_usuario(
    usuario_id: int, usuario: UsuarioIn
) -> UsuarioOut:  # PUT - Modifica el usuario con el id indicado
    query = """
        UPDATE usuarios
        SET nombre = :nombre,
            email = :email,
            password_hash = :password_hash,
            rol = :rol,
            activo = :activo,
            fecha_creacion = :fecha_creacion,
            fecha_ultima_sesion = :fecha_ultima_sesion
        WHERE id = :id
    """
    values = {**usuario.dict(), "id": usuario_id}
    await db.execute(query=query, values=values)
    return {**usuario.dict(), "id": usuario_id}


async def delete_usuario(
    id: int,
) -> dict:  # DELETE - Elimina el usuario con el id indicado
    query = "DELETE FROM usuarios WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado correctamente"}
