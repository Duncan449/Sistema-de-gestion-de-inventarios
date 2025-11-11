import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "./auth/PrivateRoute";
import Login from "./auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import StockAlmacen from "./pages/StockAlmacen";
import Usuarios from "./pages/Usuarios";
import MovimientosInventario from "./pages/MovimientosInventario";

function App() {
  return (
    <BrowserRouter>
      {/* Componente que envuelve toda la aplicación para habilitar el enrutamiento */}
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
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

          {/* Ruta de movimientos para TODOS los usuarios autenticados */}
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

          {/* Ruta solo para admin */}
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
