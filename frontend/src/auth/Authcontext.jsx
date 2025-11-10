import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(); //Crear el contexto de autenticación

export const AuthProvider = ({ children }) => {
  //Componente proveedor del contexto
  const [user, setUser] = useState(null); //Estado para almacenar el usuario autenticado
  const [loading, setLoading] = useState(true); //Estado para indicar si se está verificando la autenticación
  const API_URL = "http://localhost:8000"; //URL del backend FastAPI

  //Verificar si hay token al cargar la app
  const checkAuth = async () => {
    const token = localStorage.getItem("token"); //Obtener el token del almacenamiento local
    if (token) {
      try {
        //Decodificar el token para obtener el email
        const payload = JSON.parse(atob(token.split(".")[1]));

        //Obtener datos del usuario usando el email del token
        const res = await fetch(`${API_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Token inválido o expirado");

        const usuarios = await res.json(); //Lista de usuarios
        const usuarioActual = usuarios.find((u) => u.email === payload.sub); //Buscar el usuario actual

        if (usuarioActual) {
          //Si se encuentra, actualizar el estado
          setUser(usuarioActual);
        } else {
          throw new Error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        localStorage.removeItem("token"); //Eliminar token inválido
        setUser(null);
      }
    }
    setLoading(false); //Finalizar verificación
  };

  useEffect(() => {
    checkAuth(); //Verificar autenticación al montar el componente
  }, []);

  //Login: obtiene el token y guarda usuario
  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append("username", email); //El backend usa email como username
      formData.append("password", password);

      //Hacer petición al endpoint de login
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: formData, //Enviar datos como FormData
      });

      //Si la respuesta no es ok, manejar error
      if (!res.ok) {
        const errorData = await res.json(); //Obtener mensaje de error
        return { error: errorData.detail || "Error al iniciar sesión" }; //Retornar error
      }

      const data = await res.json(); //Respuesta con el token
      localStorage.setItem("token", data.access_token); //Guardar token en localStorage

      // Obtener los datos del usuario autenticado
      const usuariosRes = await fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${data.access_token}` }, //Incluir token en la cabecera
      });

      if (!usuariosRes.ok) {
        throw new Error("Error al obtener datos del usuario");
      }

      const usuarios = await usuariosRes.json();
      const payload = JSON.parse(atob(data.access_token.split(".")[1])); //Decodificar token
      const usuarioActual = usuarios.find((u) => u.email === payload.sub); //Buscar usuario actual

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
    //
    const token = localStorage.getItem("token"); //Obtener token

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    //Agregar cabeceras de autenticación
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}), //Mantener otras cabeceras
      Authorization: `Bearer ${token}`, //Agregar token
    };

    try {
      const res = await fetch(`${API_URL}${url}`, { ...options, headers }); //Hacer petición

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
        authFetch, //Función para hacer peticiones autenticadas
        loading, //Indica si se está verificando la autenticación
        isAuthenticated: !!user, //Indica si el usuario está autenticado
        isAdmin: user?.rol === "admin", //Indica si el usuario es admin
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
    //Renderizar hijos solo cuando no esté cargando
  );
};
