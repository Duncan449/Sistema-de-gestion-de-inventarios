from typing import List
from fastapi import APIRouter, Depends
from app.schemas.almacen import AlmacenIn, AlmacenOut
import app.services.almacen as service
from app.services.auth import require_auth

router = APIRouter()


@router.get("/", response_model=List[AlmacenOut])
async def read_almacen(usuario_actual=Depends(require_auth)):
    return await service.get_all_almacenes()


@router.get("/{id}", response_model=AlmacenOut)
async def read_almacen(id: int, usuario_actual=Depends(require_auth)):
    return await service.get_almacen_by_id(id)


@router.post("/", response_model=AlmacenOut)
async def create_almacen(almacen: AlmacenIn, usuario_actual=Depends(require_auth)):
    return await service.create_almacen(almacen)


@router.put("/{id}", response_model=AlmacenOut)
async def update_almacen(
    id: int, almacen: AlmacenIn, usuario_actual=Depends(require_auth)
):
    return await service.update_almacen(id, almacen)


@router.delete("/{id}")
async def delete_almacen(id: int, usuario_actual=Depends(require_auth)):
    return await service.delete_almacen(id)
