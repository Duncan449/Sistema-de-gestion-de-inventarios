import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import StockDetalladoTable from "../components/StockDetalladoTable";
import StockPorProductoTable from "../components/StockPorProductoTable";
import StockPorAlmacenSelector from "../components/StockPorAlmacenSelector";
import StockProductoSelector from "../components/StockProductoSelector";
import StockDialog from "../components/StockDialog";

function StockAlmacen() {
  const { authFetch, isAdmin } = useAuth();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  // Formulario
  const [formData, setFormData] = useState({
    fk_producto: "",
    fk_almacen: "",
    cantidad_disponible: "",
    cantidad_reservada: "",
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarDatosSegunTab();
  }, [tabValue, selectedProductoId, selectedAlmacenId]);

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
    setSuccess("");
  };

  const handleOpenDialog = (stock = null) => {
    if (stock) {
      setFormData({
        fk_producto: stock.fk_producto,
        fk_almacen: stock.fk_almacen,
        cantidad_disponible: stock.cantidad_disponible,
        cantidad_reservada: stock.cantidad_reservada,
      });
      setEditingId(stock.id);
    } else {
      setFormData({
        fk_producto: "",
        fk_almacen: "",
        cantidad_disponible: "",
        cantidad_reservada: "",
      });
      setEditingId(null);
    }
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingId ? `/stock_almacen/${editingId}` : "/stock_almacen";
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar stock");
      }

      setSuccess(
        editingId
          ? "Stock actualizado correctamente"
          : "Stock creado correctamente"
      );

      await cargarDatosSegunTab();

      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Stock de Almacen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona el inventario en todos los almacenes
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Stock
          </Button>
        )}
      </Box>

      {/* Mensajes */}
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
            isAdmin={isAdmin}
            handleOpenDialog={handleOpenDialog}
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
            isAdmin={isAdmin}
            handleOpenDialog={handleOpenDialog}
          />
        )}

        {tabValue === 3 && (
          <StockProductoSelector
            productos={productos}
            selectedProductoId={selectedProductoId}
            setSelectedProductoId={setSelectedProductoId}
            stock={stockConProducto}
            isAdmin={isAdmin}
            handleOpenDialog={handleOpenDialog}
          />
        )}
      </Box>

      {/* Dialog */}
      <StockDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        productos={productos}
        almacenes={almacenes}
        editingId={editingId}
        error={error}
        success={success}
      />
    </Container>
  );
}

export default StockAlmacen;
