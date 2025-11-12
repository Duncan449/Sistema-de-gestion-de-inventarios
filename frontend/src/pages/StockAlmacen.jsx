import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import StockDetalladoTable from "../components/StockDetalladoTable";
import StockPorProductoTable from "../components/StockPorProductoTable";
import StockPorAlmacenSelector from "../components/StockPorAlmacenSelector";
import StockProductoSelector from "../components/StockProductoSelector";

function StockAlmacen() {
  const { authFetch } = useAuth();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Datos
  const [stockDetallado, setStockDetallado] = useState([]);
  const [stockPorProducto, setStockPorProducto] = useState([]);
  const [stockPorAlmacen, setStockPorAlmacen] = useState([]);
  const [stockConProducto, setStockConProducto] = useState([]);

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);

  // Selectores
  const [selectedProductoId, setSelectedProductoId] = useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = useState("");

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarDatosSegunTab();
  }, [tabValue, selectedProductoId, selectedAlmacenId]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      // Cargar catálogos
      const [resProductos, resAlmacenes] = await Promise.all([
        authFetch("/productos"),
        authFetch("/almacenes"),
      ]);

      if (resProductos.ok) setProductos(await resProductos.json());
      if (resAlmacenes.ok) setAlmacenes(await resAlmacenes.json());

      // Cargar stock detallado por defecto
      await cargarStockDetallado();
    } catch (error) {
      setError("Error al cargar datos iniciales");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosSegunTab = async () => {
    switch (tabValue) {
      case 0:
        await cargarStockDetallado();
        break;
      case 1:
        await cargarStockPorProducto();
        break;
      case 2:
        if (selectedAlmacenId) await cargarStockPorAlmacen(selectedAlmacenId);
        break;
      case 3:
        if (selectedProductoId)
          await cargarStockConProducto(selectedProductoId);
        break;
    }
  };

  const cargarStockDetallado = async () => {
    try {
      const res = await authFetch("/stock_almacen");
      if (!res.ok) throw new Error("Error al cargar stock detallado");
      const data = await res.json();
      setStockDetallado(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cargarStockPorProducto = async () => {
    try {
      const res = await authFetch("/stock_almacen/por_producto");
      if (!res.ok) throw new Error("Error al cargar stock por producto");
      const data = await res.json();
      setStockPorProducto(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cargarStockPorAlmacen = async (almacenId) => {
    try {
      const res = await authFetch(`/stock_almacen/por_almacen/${almacenId}`);
      if (!res.ok) throw new Error("Error al cargar stock por almacén");
      const data = await res.json();
      setStockPorAlmacen(data);
    } catch (error) {
      console.error("Error:", error);
      setStockPorAlmacen([]);
    }
  };

  const cargarStockConProducto = async (productoId) => {
    try {
      const res = await authFetch(`/stock_almacen/producto/${productoId}`);
      if (!res.ok) throw new Error("Error al cargar stock con producto");
      const data = await res.json();
      setStockConProducto(data);
    } catch (error) {
      console.error("Error:", error);
      setStockConProducto([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setPage(1); // ⭐ RESETEAR A PÁGINA 1
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Stock de Almacén
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualiza el inventario en todos los almacenes
        </Typography>
      </Box>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 0, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            borderBottom: 1,
            borderColor: "white",
          }}
        >
          <Tab label="Vista Detallada" />
          <Tab label="Por Producto" />
          <Tab label="Por Almacén" />
          <Tab label="Buscar Producto" />
        </Tabs>
      </Paper>

      {/* Contenido según tab */}
      <Box>
        {tabValue === 0 && (
          <StockDetalladoTable
            stock={stockDetallado}
            isAdmin={false} //SIEMPRE false para ocultar botones de editar
            handleOpenDialog={() => {}} // Función vacía, no se usa
          />
        )}

        {tabValue === 1 && (
          <StockPorProductoTable
            stock={stockPorProducto}
            productos={productos}
          />
        )}

        {tabValue === 2 && (
          <StockPorAlmacenSelector
            almacenes={almacenes}
            selectedAlmacenId={selectedAlmacenId}
            setSelectedAlmacenId={setSelectedAlmacenId}
            stock={stockPorAlmacen}
            isAdmin={false} //SIEMPRE false para ocultar botones de editar
            handleOpenDialog={() => {}} // Función vacía, no se usa
          />
        )}

        {tabValue === 3 && (
          <StockProductoSelector
            productos={productos}
            selectedProductoId={selectedProductoId}
            setSelectedProductoId={setSelectedProductoId}
            stock={stockConProducto}
            isAdmin={false} //SIEMPRE false para ocultar botones de editar
            handleOpenDialog={() => {}} // Función vacía, no se usa
          />
        )}
      </Box>
    </Container>
  );
}

export default StockAlmacen;
