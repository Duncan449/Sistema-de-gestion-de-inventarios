from fastapi import FastAPI
from app.config.database import db
from app.routes import (
    usuarioRoutes,
    categoriaRoutes,
    proveedorRoutes,
    almacenRoutes,
    productoRoutes,
    movimiento_inventarioRoutes,
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await db.connect()
        print("✅ Conexión exitosa con la BD ")
    except Exception as e:
        print(f"❌Error al conectarse a la base de datos: {e}")


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/")
async def root():
    return {"message": "Bienvenidos a nuestro Sistema de gestión de inventario"}


app.include_router(usuarioRoutes.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(proveedorRoutes.router, prefix="/proveedores", tags=["Proveedores"])
app.include_router(categoriaRoutes.router, prefix="/categorias", tags=["Categorias"])
app.include_router(almacenRoutes.router, prefix="/almacenes", tags=["Almacenes"])
app.include_router(productoRoutes.router, prefix="/productos", tags=["Productos"])
app.include_router(movimiento_inventarioRoutes.router, prefix="/movimientos", tags=["Movimientos Inventario"])
