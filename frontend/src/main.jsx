import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

//Tema global personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e8678ff", // Azul profesional (botones, enlaces, títulos)
      light: "#c7e0dcff",
      dark: "#1e554cff",
      contrastText: "#ffffff", // Texto sobre botones azules
    },
    secondary: {
      main: "#477f99ff", // Gris azulado (complementario)
      light: "#718792",
      dark: "#1c313a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f6f8", // Fondo general claro
      paper: "#ffffff", // Fondo de tarjetas y formularios
    },
    text: {
      primary: "#212121", // Texto principal oscuro
      secondary: "#616161", // Texto secundario gris
    },
    error: {
      main: "#d32f2f", // Rojo para errores
    },
    success: {
      main: "#388e3c", // Verde para mensajes de éxito
    },
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,sans-serif",
    h4: {
      fontWeight: 600,
      color: "#8b99a7ff", // Color de títulos principales
    },
    body1: {
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 8, // Bordes suaves en botones y campos
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Evita mayúsculas automáticas
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: "none",
          ":hover": {
            boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            color: "#616161",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#2e8678ff",
          },
          "& .MuiOutlinedInput-root fieldset": {
            borderColor: "#cfd8dc",
          },
          "& .MuiOutlinedInput-root:hover fieldset": {
            borderColor: "#2e8678ff",
          },
          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            borderColor: "#2e8678ff",
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  //Usamos StrictMode para detectar problemas potenciales en la app
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza estilos y aplica el fondo */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
