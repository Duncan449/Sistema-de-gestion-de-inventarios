from pydantic import BaseModel, EmailStr
from datetime import datetime


class UsuarioIn(BaseModel):
    nombre: str
    email: EmailStr
    password_hash: str
    rol: str
    activo: bool = True
    fecha_creacion: datetime | None = None
    fecha_ultima_sesion: datetime | None = None


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    password_hash: str
    rol: str
    activo: bool = True
    fecha_creacion: datetime | None = None
    fecha_ultima_sesion: datetime | None = None
