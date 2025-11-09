import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 🧱 Tema global profesional
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Azul profesional (botones, enlaces, títulos)
      light: "#63a4ff",
      dark: "#004ba0",
      contrastText: "#ffffff", // Texto sobre botones azules
    },
    secondary: {
      main: "#455a64", // Gris azulado (complementario)
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
    fontFamily: "Poppins, Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 600,
      color: "#1976d2", // Color de títulos principales
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
            color: "#1976d2",
          },
          "& .MuiOutlinedInput-root fieldset": {
            borderColor: "#cfd8dc",
          },
          "& .MuiOutlinedInput-root:hover fieldset": {
            borderColor: "#1976d2",
          },
          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza estilos y aplica el fondo */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
