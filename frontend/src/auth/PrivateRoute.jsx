import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

//Componente para proteger rutas que requieren autenticación
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  //Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  //Si requiere un rol específico y el usuario no lo tiene, redirigir
  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

//Componente para rutas solo de admin
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};
