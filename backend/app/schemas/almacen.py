from pydantic import BaseModel
from datetime import datetime


class AlmacenIn(BaseModel):
    nombre: str
    ubicacion: str
    capacidad_maxima: int
    activo: bool = True
    fecha_creacion: datetime | None = None


class AlmacenOut(BaseModel):
    id: int
    nombre: str
    ubicacion: str
    capacidad_maxima: int
    activo: bool = True
    fecha_creacion: datetime | None = None