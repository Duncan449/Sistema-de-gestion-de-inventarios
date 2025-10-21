from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class ProveedorIn(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    activo: bool = True


class ProveedorOut(BaseModel):
    id: int
    nombre: str
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    activo: bool = True
    fecha_creacion: Optional[datetime] = None