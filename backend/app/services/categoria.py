from typing import List
from fastapi import HTTPException
from app.config.database import db
from app.schemas.categoria import CategoriaIn, CategoriaOut

# CRUD CATEGORIA


async def get_all_categorias() -> (
    List[CategoriaOut]
):  # GET - Trae a todas las categorias de la BD
    query = "SELECT * FROM categorias"
    rows = await db.fetch_all(query=query)
    return rows


async def get_categoria_by_id(
    id: int,
) -> CategoriaOut:  # GET - Trae a la categoría con el id indicado
    query = "SELECT * FROM categorias WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return row


async def create_categoria(
    categoria: CategoriaIn,
) -> CategoriaOut:  # POST - Crea un categoria

    revision_query = "SELECT id FROM categorias WHERE nombre = :nombre"
    existe = await db.fetch_one(
        revision_query, values={"nombre": categoria.nombre}
    )  # Verificación de que la categoría no esté ya registrada
    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"La categoría {categoria.nombre} ya está registrada",
        )

    try:
        query = """
            INSERT INTO categorias (nombre, descripcion, activa)
            VALUES (:nombre, :descripcion, :activa)
        """
        last_record_id = await db.execute(query=query, values=categoria.dict())
        return await get_categoria_by_id(last_record_id)

    except Exception as e:
        print(f"Error al crear categoría: {e}")
        raise HTTPException(
            status_code=500, detail="Error al crear la categoría. Intente nuevamente."
        )


async def update_categoria(
    categoria_id: int, categoria: CategoriaIn
) -> CategoriaOut:  # PUT - Modifica el categoria con el id indicado
    revision_query = "SELECT id FROM categorias WHERE id = :id"  # Verificación de que la categoria exista
    existing = await db.fetch_one(revision_query, values={"id": categoria_id})
    if not existing:
        raise HTTPException(
            status_code=404, detail=f"Categoria con id {categoria_id} no encontrada"
        )

    nombre_query = "SELECT id FROM categorias WHERE nombre = :nombre AND id != :id"  # Para evitar ponerle el nombre de una categoría ya existente
    nombre_exists = await db.fetch_one(
        nombre_query, values={"nombre": categoria.nombre, "id": categoria_id}
    )
    if nombre_exists:
        raise HTTPException(
            status_code=400, detail=f"El nombre {categoria.nombre} ya está en uso"
        )

    try:
        query = """
            UPDATE categorias
            SET nombre = :nombre,
                descripcion = :descripcion,
                activa = :activa
            WHERE id = :id
        """
        values = {**categoria.dict(), "id": categoria_id}
        await db.execute(query=query, values=values)
        return await get_categoria_by_id(categoria_id)

    except Exception as e:
        print(f"Error al actualizar categoría: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar la categoría")


async def delete_categoria(
    id: int,
) -> dict:  # DELETE - Elimina la categoria con el id indicado
    revision_query = (
        "SELECT id FROM categorias WHERE id = :id"  # Verifica que exista la categoria
    )
    existe = await db.fetch_one(revision_query, values={"id": id})
    if not existe:
        raise HTTPException(
            status_code=404, detail=f"Categoria con id {id} no encontrada"
        )

    try:
        query = "DELETE FROM categorias WHERE id = :id"
        await db.execute(query=query, values={"id": id})
        return {"message": f"Categoria con id {id} eliminada correctamente"}

    except Exception as e:
        print(f"Error al eliminar categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar la categoría")
