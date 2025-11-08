from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.usuario import UsuarioIn, UsuarioOut, UsuarioUpdate

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

    revision_query = "SELECT id FROM usuarios WHERE email = :email"
    existe = await db.fetch_one(
        revision_query, values={"email": usuario.email}
    )  # Verificación de que el correo no esté ya registrado
    if existe:
        raise HTTPException(
            status_code=400, detail=f"El email {usuario.email} ya está registrado"
        )

    try:
        query = """
            INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
            VALUES (:nombre, :email, :password_hash, :rol, :activo)
        """
        last_record_id = await db.execute(query=query, values=usuario.dict())
        return await get_usuario_by_id(last_record_id)

    except Exception as e:
        print(f"Error al crear usuario: {e}")
        raise HTTPException(
            status_code=500, detail="Error al crear el usuario. Intente nuevamente."
        )


async def update_usuario(
    usuario_id: int, usuario: UsuarioUpdate
) -> UsuarioOut:  # PUT - Modifica el usuario con el id indicado
    revision_query = "SELECT id FROM usuarios WHERE id = :id"  # Verificación de que el usuario exista
    existe = await db.fetch_one(revision_query, values={"id": usuario_id})
    if not existe:
        raise HTTPException(
            status_code=404, detail=f"Usuario con id {usuario_id} no encontrado"
        )

    email_query = "SELECT id FROM usuarios WHERE email = :email AND id != :id"  # Verificación de que el nuevo email no esté ya en uso
    email_existe = await db.fetch_one(
        email_query, values={"email": usuario.email, "id": usuario_id}
    )
    if email_existe:
        raise HTTPException(
            status_code=400, detail=f"El email {usuario.email} ya está en uso"
        )

    try:
        query = """
            UPDATE usuarios
            SET nombre = :nombre,
                email = :email,
                rol = :rol,
            WHERE id = :id
        """
        values = {**usuario.dict(), "id": usuario_id}
        await db.execute(query=query, values=values)
        return await get_usuario_by_id(usuario_id)

    except Exception as e:
        print(f"Error al actualizar usuario: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar el usuario")


async def delete_usuario(
    id: int,
) -> dict:  # DELETE - Elimina el usuario con el id indicado
    revision_query = (
        "SELECT id FROM usuarios WHERE id = :id"  # Verifica que exista el usuario
    )
    existe = await db.fetch_one(revision_query, values={"id": id})
    if not existe:
        raise HTTPException(
            status_code=404, detail=f"Usuario con id {id} no encontrado"
        )

    try:
        query = "DELETE FROM usuarios WHERE id = :id"
        await db.execute(query=query, values={"id": id})
        return {"message": f"Usuario con id {id} eliminado correctamente"}

    except Exception as e:
        print(f"Error al eliminar usuario: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar el usuario")
