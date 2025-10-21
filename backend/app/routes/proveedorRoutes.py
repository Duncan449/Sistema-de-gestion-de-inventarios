# backend/app/routes/proveedorRoutes.py
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.proveedor import ProveedorIn, ProveedorOut
import app.services.proveedor as service

router = APIRouter()


@router.get("/", response_model=List[ProveedorOut])
async def read_proveedores():
    """Obtener todos los proveedores"""
    try:
        return await service.get_all_proveedores()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error inesperado al obtener proveedores"
        )


@router.get("/{id}", response_model=ProveedorOut)
async def read_proveedor(id: int):
    """Obtener un proveedor por ID"""
    return await service.get_proveedor_by_id(id)


@router.post("/", response_model=ProveedorOut, status_code=status.HTTP_201_CREATED)
async def create_proveedor(proveedor: ProveedorIn):
    """Crear un nuevo proveedor"""
    return await service.create_proveedor(proveedor)


@router.put("/{id}", response_model=ProveedorOut)
async def update_proveedor(id: int, proveedor: ProveedorIn):
    """Actualizar un proveedor existente"""
    return await service.update_proveedor(id, proveedor)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_proveedor(id: int):
    """Eliminar un proveedor"""
    return await service.delete_proveedor(id)
    return await service.delete_proveedor(id)