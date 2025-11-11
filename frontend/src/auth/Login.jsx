import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Container, //Contenedor centrado y con ancho máximo
  Box, //Componente de caja para diseño flexible
  TextField, //Campo de texto para entradas de usuario
  Button, //Botón interactivo
  Typography, //Componente para texto con estilos predefinidos
  Paper, //Tarjeta con sombra (fondo blanco elevado)
  Alert, //Componente para mostrar mensajes de error o información
  CircularProgress, //Indicador de carga circular
} from "@mui/material";

function Login() {
  /*
    Función componente llamada Login, ya que en react, los componentes
    funcionales son funciones que devuelven JSX (la estructura que se renderiza)
*/
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /*
formData: es un objeto que guarda los valores del formulario. 
Inicialmente { usuario: "", contraseña: "" }

setFormData: función para actualizar formData

error: string que guarda el mensaje de error (si hay). Inicialmente vacío

setError: función para actualizar error

Cada vez que llamás a setFormData o setError, react re-renderiza 
el componente con los nuevos valores
*/

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /*
handleChange se ejecutará cuando el usuario escriba en cualquier TextField

e es el evento del input; e.target es el elemento que disparó el evento

const { name, value } = e.target; extrae el name y el value del input 
(importante: los TextField tienen la prop name="usuario" o name="contraseña")

setFormData({ ...formData, [name]: value });
Actualiza formData manteniendo las demás propiedades (...formData) y 
cambiando solo la propiedad cuyo nombre viene en name. Esto permite usar un solo handler para ambos campos
*/

  //Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Por favor complete ambos campos");
      return;
    }

    setLoading(true); //Indica que se está procesando el login

    try {
      const result = await login(formData.email, formData.password);
      if (result.error) {
        //Si hay un error en el login, lo muestra
        setError(result.error);
      } else {
        //Redirigir al dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Error al intentar iniciar sesión");
      console.error("Error en login:", err);
    } finally {
      setLoading(false); //Termina el estado de carga independientemente del resultado
    }
  };

  return (
    //El return contiene la estructura visual del Login
    <Container
      maxWidth="sm" //Ancho máximo pequeño (sm) para centrar el formulario
      sx={{
        //Estilos con la prop sx de MUI
        display: "flex", //Usar flexbox para centrar
        alignItems: "center", //Centrar contenido verticalmente
        justifyContent: "center", //Centrar contenido horizontalmente
        height: "100vh", //Altura completa de la ventana
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
        <Typography
          variant="h4" //Título grande
          align="center" //Centrar texto
          gutterBottom //Margen inferior para separar del contenido siguiente
          sx={{ color: "primary.main", fontWeight: "bold" }} //Usa el color principal del theme y lo pone en negrita
        >
          Iniciar Sesión
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "text.secondary", marginBottom: 3 }}
        >
          Sistema de Gestión de Inventario
        </Typography>

        {error && ( //Si error no está vacío, mostrar el alert rojo por defecto
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form" //Actúa como div, pero aquí component="form" hace que el Box sea un <form>
          onSubmit={handleSubmit} //Cuando se envía el formulario
          sx={{ display: "flex", flexDirection: "column", gap: 2 }} //Organiza los hijos en columna y agrega espacio entre ellos
        >
          <TextField
            label="Email"
            name="email" //Nombre del campo para identificarlo en handleChange
            value={formData.usuario} //Valor controlado por formData.usuario
            onChange={handleChange} //Actualiza el estado cuando el usuario escribe
            variant="outlined" //Estilo del TextField
            fullWidth //Ocupa todo el ancho disponible
            disabled={loading}
          />
          <TextField
            label="Contraseña"
            name="password" //Nombre del campo para identificarlo en handleChange
            type="password" //Oculta el texto ingresado
            value={formData.contraseña}
            onChange={handleChange}
            variant="outlined" //Si fuera contained sería relleno
            fullWidth
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.5,
              position: "relative",
            }}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-12px",
                  }}
                />
                <span style={{ opacity: 0.5 }}>Iniciando sesión...</span>
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

//Se cierran las etiquetas y la función retorna el JSX completo

export default Login; //Exporta el componente para usarlo en otros archivos
