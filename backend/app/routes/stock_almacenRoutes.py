from typing import List
from fastapi import APIRouter, Depends
from app.schemas.stock_almacen import Stock_AlmacenIn, Stock_AlmacenOut
import app.services.stock_almacen as service
from app.services.auth import require_auth

router = APIRouter()


@router.get("/", response_model=List[Stock_AlmacenOut])
async def read_stock_almacen(usuario_actual=Depends(require_auth)):
    return await service.get_all_stock_almacenes()


@router.get("/producto/{producto_id}", response_model=List[Stock_AlmacenOut])
async def read_stock_con_producto(producto_id: int, usuario_actual=Depends(require_auth)):
    return await service.get_stock_con_producto(producto_id)


@router.get("/minimo/{almacen_id}", response_model=List[Stock_AlmacenOut])
async def read_stock_minimo_por_almacen(almacen_id: int, usuario_actual=Depends(require_auth)):
    return await service.get_stock_minimo_por_almacen(almacen_id)


@router.get("/por_producto", response_model=List[Stock_AlmacenOut])
async def read_stock_por_producto(usuario_actual=Depends(require_auth)):
    return await service.get_stock_por_producto()   


@router.get("/por_almacen/{almacen_id}", response_model=List[Stock_AlmacenOut])
async def read_stock_por_almacen(almacen_id: int, usuario_actual=Depends(require_auth)):
    return await service.get_stock_por_almacen(almacen_id)  


@router.get("/{id}", response_model=Stock_AlmacenOut)
async def read_stock_almacen(id: int, usuario_actual=Depends(require_auth)):
    return await service.get_stock_almacen_by_id(id)


@router.post("/", response_model=Stock_AlmacenOut)
async def create_stock_almacen(
    stock_almacen: Stock_AlmacenIn, usuario_actual=Depends(require_auth)
):
    return await service.create_stock_almacen(stock_almacen)


@router.put("/{id}", response_model=Stock_AlmacenOut)
async def update_stock_almacen(
    id: int, stock_almacen: Stock_AlmacenIn, usuario_actual=Depends(require_auth)
):
    return await service.update_stock_almacen(id, stock_almacen)


@router.delete("/{id}")
async def delete_stock_almacen(id: int, usuario_actual=Depends(require_auth)):
    return await service.delete_stock_almacen(id)
