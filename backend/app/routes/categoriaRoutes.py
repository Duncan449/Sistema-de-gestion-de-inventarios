from typing import List
from fastapi import APIRouter
from app.schemas.categoria import CategoriaIn, CategoriaOut
import app.services.categoria as service

router = APIRouter()


@router.get(
    "/",
    response_model=List[CategoriaOut],
)
async def read_categorias():
    return await service.get_all_categorias()


@router.get("/{id}", response_model=CategoriaOut)
async def read_categoria(id: int):
    return await service.get_categoria_by_id(id)


@router.post("/", response_model=CategoriaOut)
async def create_categoria(categoria: CategoriaIn):
    return await service.create_categoria(categoria)


@router.put("/{id}", response_model=CategoriaOut)
async def update_categoria(id: int, categoria: CategoriaIn):
    return await service.update_categoria(id, categoria)


@router.delete("/{id}")
async def delete_categoria(id: int):
    return await service.delete_categoria(id)
