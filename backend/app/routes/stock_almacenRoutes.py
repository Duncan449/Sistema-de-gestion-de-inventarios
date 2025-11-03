from typing import List
from fastapi import APIRouter
from app.schemas.stock_almacen import Stock_AlmacenIn, Stock_AlmacenOut
import app.services.stock_almacen as service

router = APIRouter()

@router.get("/", response_model=List[Stock_AlmacenOut])
async def read_stock_almacen():
    return await service.get_all_stock_almacenes()


@router.get("/{id}", response_model=Stock_AlmacenOut)
async def read_stock_almacen (id: int):
    return await service.get_stock_almacen_by_id(id)


@router.post("/", response_model=Stock_AlmacenOut)
async def create_stock_almacen(stock_almacen: Stock_AlmacenIn):
    return await service.create_stock_almacen(stock_almacen)


@router.put("/{id}", response_model=Stock_AlmacenOut)
async def update_stock_almacen(id: int, stock_almacen: Stock_AlmacenIn):
    return await service.update_stock_almacen(id, stock_almacen)


@router.delete("/{id}")
async def delete_stock_almacen(id: int):
    return await service.delete_stock_almacen(id)