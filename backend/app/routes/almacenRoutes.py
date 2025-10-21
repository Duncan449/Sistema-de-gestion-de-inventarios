from typing import List
from fastapi import APIRouter
from app.schemas.almacen import AlmacenIn, AlmacenOut
import app.services.almacen as service

router = APIRouter()

@router.get("/", response_model=List[AlmacenOut])
async def read_almacen():
    return await service.get_all_almacenes()


@router.get("/{id}", response_model=AlmacenOut)
async def read_almacen(id: int):
    return await service.get_almacen_by_id(id)


@router.post("/", response_model=AlmacenOut)
async def create_almacen(almacen: AlmacenIn):
    return await service.create_almacen(almacen)


@router.put("/{id}", response_model=AlmacenOut)
async def update_almacen(id: int, almacen: AlmacenIn):
    return await service.update_almacen(id, almacen)


@router.delete("/{id}")
async def delete_almacen(id: int):
    return await service.delete_almacen(id)