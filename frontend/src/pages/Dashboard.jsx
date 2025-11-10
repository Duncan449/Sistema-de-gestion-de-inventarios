import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ResumenCard from "../components/ResumenCard";
import ProductoCard from "../components/ProductoCard";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
} from "@mui/material";

function Dashboard() {
  const { user, logout, authFetch } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await authFetch("/productos");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        px: 5, // margen horizontal
        pt: 4, // margen superior más chico
        pb: 4, // margen inferior igual
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
      >
        ¡Bienvenido/a, {user?.nombre}!
      </Typography>

      <Typography
        variant="h6"
        sx={{ color: "text.secondary", mb: 3, fontWeight: "bold" }}
      >
        Resumen de productos
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Cards de resumen */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <ResumenCard
                title="Total Productos"
                value={productos.length}
                description="Total registrados en el sistema"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ResumenCard
                title="Productos Activos"
                value={productos.filter((p) => p.activo).length}
                color="primary"
                description="En stock actualmente"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ResumenCard
                title="Inactivos"
                value={productos.filter((p) => !p.activo).length}
                color="error"
                description="Sin disponibilidad"
              />
            </Grid>
          </Grid>

          {/* Lista de productos */}
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", mb: 2, fontWeight: "bold" }}
          >
            Últimos productos
          </Typography>

          <Grid container spacing={3}>
            {productos.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No hay productos registrados
                </Typography>
              </Grid>
            ) : (
              productos.slice(0, 6).map((producto) => (
                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                  <ProductoCard producto={producto} />
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
