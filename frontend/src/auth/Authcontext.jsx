import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:8000"; // URL de tu backend FastAPI

  // Verificar si hay token al cargar la app
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decodificar el token para obtener el email
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Obtener datos del usuario usando el email del token
        const res = await fetch(`${API_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Token inválido o expirado");

        const usuarios = await res.json();
        const usuarioActual = usuarios.find((u) => u.email === payload.sub);

        if (usuarioActual) {
          setUser(usuarioActual);
        } else {
          throw new Error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login: obtiene el token y guarda usuario
  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append("username", email); // Tu backend usa email como username
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.detail || "Error al iniciar sesión" };
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);

      // Obtener los datos del usuario autenticado
      const usuariosRes = await fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!usuariosRes.ok) {
        throw new Error("Error al obtener datos del usuario");
      }

      const usuarios = await usuariosRes.json();
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      const usuarioActual = usuarios.find((u) => u.email === payload.sub);

      if (usuarioActual) {
        setUser(usuarioActual);
        return { success: true, user: usuarioActual };
      } else {
        throw new Error("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { error: error.message || "Error al iniciar sesión" };
    }
  };

  // Registro de nuevo usuario
  const registro = async (nombre, email, password, rol = "empleado") => {
    try {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.detail || "Error al registrar usuario" };
      }

      const userData = await res.json();
      return { success: true, user: userData };
    } catch (error) {
      console.error("Error en registro:", error);
      return { error: error.message || "Error al registrar usuario" };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Petición autenticada con fetch
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    try {
      const res = await fetch(`${API_URL}${url}`, { ...options, headers });

      // Si el token expiró, hacer logout
      if (res.status === 401) {
        logout();
        throw new Error("Sesión expirada");
      }

      return res;
    } catch (error) {
      console.error("Error en authFetch:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        registro,
        authFetch,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.rol === "admin",
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
