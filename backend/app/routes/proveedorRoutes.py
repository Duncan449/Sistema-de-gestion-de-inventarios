# backend/app/routes/proveedorRoutes.py
from typing import List
from fastapi import APIRouter
from app.schemas.proveedor import ProveedorIn, ProveedorOut
import app.services.proveedor as service

router = APIRouter()


@router.get("/", response_model=List[ProveedorOut])
async def read_proveedores():
    """Obtener todos los proveedores"""
    return await service.get_all_proveedores()


@router.get("/{id}", response_model=ProveedorOut)
async def read_proveedor(id: int):
    """Obtener un proveedor por ID"""
    return await service.get_proveedor_by_id(id)


@router.post("/", response_model=ProveedorOut)
async def create_proveedor(proveedor: ProveedorIn):
    """Crear un nuevo proveedor"""
    return await service.create_proveedor(proveedor)


@router.put("/{id}", response_model=ProveedorOut)
async def update_proveedor(id: int, proveedor: ProveedorIn):
    """Actualizar un proveedor existente"""
    return await service.update_proveedor(id, proveedor)


@router.delete("/{id}")
async def delete_proveedor(id: int):
    """Eliminar un proveedor"""
    return await service.delete_proveedor(id)
