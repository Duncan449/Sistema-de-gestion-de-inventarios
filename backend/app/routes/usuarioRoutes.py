from typing import List
from fastapi import APIRouter
from app.schemas.usuario import UsuarioIn, UsuarioOut
import app.services.usuario as service

router = APIRouter()


@router.get(
    "/",
    response_model=List[UsuarioOut],
)
async def read_usuarios():
    return await service.get_all_usuarios()


@router.get("/{id}", response_model=UsuarioOut)
async def read_usuario(id: int):
    return await service.get_usuario_by_id(id)


@router.post("/", response_model=UsuarioOut)
async def create_usuario(usuario: UsuarioIn):
    return await service.create_usuario(usuario)


@router.put("/{id}", response_model=UsuarioOut)
async def update_usuario(id: int, usuario: UsuarioIn):
    return await service.update_usuario(id, usuario)


@router.delete("/{id}")
async def delete_usuario(id: int):
    return await service.delete_usuario(id)
