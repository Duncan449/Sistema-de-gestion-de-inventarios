from typing import List
from fastapi import APIRouter, Depends
from app.schemas.movimiento_inventario import (
    MovimientoInventarioIn,
    MovimientoInventarioOut,
)
import app.services.movimiento_inventario as service
from app.services.auth import require_auth

router = APIRouter()


@router.get("/", response_model=List[MovimientoInventarioOut])
async def read_movimientos(usuario_actual=Depends(require_auth)):
    return await service.get_all_movimientos()


@router.get("/{id}", response_model=MovimientoInventarioOut)
async def read_movimiento(id: int, usuario_actual=Depends(require_auth)):
    return await service.get_movimiento_by_id(id)


@router.post("/", response_model=MovimientoInventarioOut)
async def create_movimiento(
    movimiento: MovimientoInventarioIn, usuario_actual=Depends(require_auth)
):
    return await service.create_movimiento(movimiento)


@router.delete("/{id}")
async def delete_movimiento(id: int, usuario_actual=Depends(require_auth)):
    return await service.delete_movimiento(id)
