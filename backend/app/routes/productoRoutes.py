from typing import List
from fastapi import APIRouter, Depends
from app.schemas.producto import ProductoIn, ProductoOut
import app.services.producto as service
from app.services.auth import require_auth

router = APIRouter()


@router.get(
    "/",
    response_model=List[ProductoOut],
)
async def read_productos(usuario_actual=Depends(require_auth)):
    return await service.get_all_productos()


@router.get("/{id}", response_model=ProductoOut)
async def read_producto(id: int, usuario_actual=Depends(require_auth)):
    return await service.get_producto_by_id(id)


@router.post("/", response_model=ProductoOut)
async def create_producto(producto: ProductoIn, usuario_actual=Depends(require_auth)):
    return await service.create_producto(producto)


@router.put("/{id}", response_model=ProductoOut)
async def update_producto(
    id: int, producto: ProductoIn, usuario_actual=Depends(require_auth)
):
    return await service.update_producto(id, producto)


@router.delete("/{id}")
async def delete_producto(id: int, usuario_actual=Depends(require_auth)):
    return await service.delete_producto(id)
