from typing import List
from fastapi import APIRouter
from app.schemas.producto import ProductoIn, ProductoOut
import app.services.producto as service

router = APIRouter()


@router.get(
    "/",
    response_model=List[ProductoOut],
)
async def read_productos():
    return await service.get_all_productos()


@router.get("/{id}", response_model=ProductoOut)
async def read_producto(id: int):
    return await service.get_producto_by_id(id)


@router.post("/", response_model=ProductoOut)
async def create_producto(producto: ProductoIn):
    return await service.create_producto(producto)


@router.put("/{id}", response_model=ProductoOut)
async def update_producto(id: int, producto: ProductoIn):
    return await service.update_producto(id, producto)


@router.delete("/{id}")
async def delete_producto(id: int):
    return await service.delete_producto(id)
