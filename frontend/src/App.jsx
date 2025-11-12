import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "./auth/PrivateRoute";
import Login from "./auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import StockAlmacen from "./pages/StockAlmacen";
import Usuarios from "./pages/Usuarios";
import MovimientosInventario from "./pages/Movimientosinventario";
import Almacenes from "./pages/Almacenes";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas para todos */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Productos />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stock-almacen"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StockAlmacen />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimientos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MovimientosInventario />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas para todos los usuarios autenticados (ver sin editar para empleados) */}
          <Route
            path="/almacenes"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Almacenes />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Categorias />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/proveedores"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Proveedores />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas solo para admin */}
          <Route
            path="/usuarios"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <Usuarios />
                </DashboardLayout>
              </AdminRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
