# backend/app/schemas/proveedor.py
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional


class ProveedorIn(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100, description="Nombre del proveedor")
    telefono: Optional[str] = Field(None, max_length=20, description="Teléfono de contacto")
    email: Optional[EmailStr] = Field(None, description="Email del proveedor")
    direccion: Optional[str] = Field(None, max_length=255, description="Dirección física")
    ciudad: Optional[str] = Field(None, max_length=50, description="Ciudad")
    activo: bool = True

    @validator('nombre')
    def nombre_no_vacio(cls, v):
        """Validar que el nombre no sea solo espacios"""
        if not v or v.strip() == "":
            raise ValueError('El nombre no puede estar vacío')
        return v.strip()
    
    @validator('telefono')
    def validar_telefono(cls, v):
        """Validar formato básico de teléfono"""
        if v and v.strip():
            # Quitar espacios y caracteres especiales comunes
            telefono_limpio = v.strip().replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not telefono_limpio.isdigit():
                raise ValueError('El teléfono solo debe contener números')
            if len(telefono_limpio) < 10:
                raise ValueError('El teléfono debe tener al menos 10 dígitos')
            return telefono_limpio
        return v
    
    @validator('email')
    def email_lowercase(cls, v):
        """Convertir email a minúsculas"""
        if v:
            return v.lower()
        return v


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