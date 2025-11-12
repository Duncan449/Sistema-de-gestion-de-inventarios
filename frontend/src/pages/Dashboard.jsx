import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ResumenCard from "../components/ResumenCard";
import ProductoCard from "../components/ProductoCard";
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  SwapHoriz as MovementIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

function Dashboard() {
  const { user, authFetch, isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAdmin) cargarProductos();
    else setLoading(false);
  }, [isAdmin]);

  const cargarProductos = async () => {
    // Helper para parsear fechas con formato dd/mm/YYYY HH:MM:SS
    const parseFecha = (fechaStr) => {
      if (!fechaStr) return null;
      // esperar formato 'DD/MM/YYYY HH:MM:SS'
      const [datePart, timePart] = fechaStr.split(" ");
      if (!datePart) return null;
      const [dd, mm, yyyy] = datePart.split("/");
      const [hh = "0", min = "0", ss = "0"] = (timePart || "").split(":");
      const iso = `${yyyy.padStart(4, "0")}-${(mm || "").padStart(2, "0")}-${(
        dd || ""
      ).padStart(2, "0")}T${(hh || "0").padStart(2, "0")}:${(
        min || "0"
      ).padStart(2, "0")}:${(ss || "0").padStart(2, "0")}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    };

    try {
      const res = await authFetch("/productos");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();

      // Si es admin, también intentar obtener los productos borrados y combinarlos
      let all = data;
      try {
        const resBorrados = await authFetch("/productos/borrados");
        if (resBorrados.ok) {
          const dataB = await resBorrados.json();
          // Evitar duplicados: usar id como clave (en caso de datos inconsistentes)
          const map = new Map();
          [...data, ...dataB].forEach((p) => map.set(p.id, p));
          all = Array.from(map.values());
        }
      } catch (err) {
        // si falla la carga de borrados, seguimos con los activos
        console.warn("No se pudieron cargar productos borrados:", err);
      }

      // Ordenar por fecha_creacion descendente (los sin fecha al final)
      all.sort((a, b) => {
        const da = parseFecha(a.fecha_creacion) || new Date(0);
        const db = parseFecha(b.fecha_creacion) || new Date(0);
        return db - da;
      });

      setProductos(all);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async (endpoint, nombreArchivo, tipo) => {
    setLoadingPdf(tipo);
    setError("");
    setSuccess("");

    try {
      const res = await authFetch(endpoint);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al generar el reporte");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Reporte generado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoadingPdf(null);
    }
  };

  const descargarStockBajo = () => {
    descargarPDF(
      "/reportes/stock-bajo",
      "reporte_stock_bajo.pdf",
      "stock-bajo"
    );
  };

  const descargarInventarioGeneral = () => {
    descargarPDF(
      "/reportes/inventario-general",
      "reporte_inventario_general.pdf",
      "inventario"
    );
  };

  const descargarMovimientos = () => {
    descargarPDF(
      "/reportes/movimientos",
      "reporte_movimientos.pdf",
      "movimientos"
    );
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        px: 5,
        pt: 4,
        pb: 4,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : isAdmin ? (
        <>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
          >
            ¡Bienvenido/a, {user?.nombre}!
          </Typography>

          {/* Resumen de productos */}
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", mb: 3, fontWeight: "bold" }}
          >
            Resumen de productos
          </Typography>

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

          {/* Reportes PDF */}
          <Divider sx={{ my: 4 }} />
          <Grid container spacing={2}>
            {/* Reporte Stock Bajo */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <WarningIcon
                      sx={{ fontSize: 28, color: "error.main", mr: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      Stock Bajo
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Reporte de productos con stock por debajo del mínimo
                    establecido
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={
                    loadingPdf === "stock-bajo" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={descargarStockBajo}
                  disabled={loadingPdf !== null}
                  sx={{ borderRadius: 2 }}
                >
                  {loadingPdf === "stock-bajo"
                    ? "Generando..."
                    : "Descargar PDF"}
                </Button>
              </Paper>
            </Grid>

            {/* Reporte Inventario General */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <InventoryIcon
                      sx={{ fontSize: 28, color: "primary.main", mr: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      Inventario General
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Reporte completo del inventario con todos los productos y su
                    valor
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={
                    loadingPdf === "inventario" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={descargarInventarioGeneral}
                  disabled={loadingPdf !== null}
                  sx={{ borderRadius: 2 }}
                >
                  {loadingPdf === "inventario"
                    ? "Generando..."
                    : "Descargar PDF"}
                </Button>
              </Paper>
            </Grid>

            {/* Reporte Movimientos */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <MovementIcon
                      sx={{ fontSize: 28, color: "secondary.main", mr: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      Movimientos
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Reporte histórico de todos los movimientos del inventario
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={
                    loadingPdf === "movimientos" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={descargarMovimientos}
                  disabled={loadingPdf !== null}
                  sx={{ borderRadius: 2 }}
                >
                  {loadingPdf === "movimientos"
                    ? "Generando..."
                    : "Descargar PDF"}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            minHeight: "70vh",
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary.main"
            sx={{ mb: 5 }}
          >
            ¡Bienvenido/a, {user?.nombre}!
          </Typography>

          <Typography
            variant="h6"
            fontWeight="bold"
            color="grey"
            sx={{ maxWidth: "1000px" }}
          >
            El sistema de gestión de inventario permite registrar, consultar y
            controlar los movimientos de productos entre almacenes. Los
            empleados pueden registrar nuevos movimientos y visualizar sus
            propias operaciones, manteniendo actualizado el flujo de existencias
            en tiempo real.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
