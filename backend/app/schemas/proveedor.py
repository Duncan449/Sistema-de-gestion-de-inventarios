# backend/app/schemas/proveedor.py
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
    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%d/%m/%Y %H:%M:%S") if v else None
        }