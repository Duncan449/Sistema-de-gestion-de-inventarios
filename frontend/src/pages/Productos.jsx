import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ProductoStats from "../components/ProductoStats";
import ProductoTable from "../components/ProductoTable";
import ProductoDialog from "../components/ProductoDialog";

function Productos() {
  const { authFetch, isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({ total: 0, activos: 0, valorTotal: 0 });

  // Nuevos estados que faltaban 👇
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio_compra: "",
    precio_venta: "",
    fk_categoria: "",
    fk_proveedor: "",
    stock_minimo: "",
    activo: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularEstadisticas();
  }, [productos]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resProductos = await authFetch("/productos");
      if (!resProductos.ok) throw new Error("Error al cargar productos");
      const dataProductos = await resProductos.json();
      setProductos(dataProductos);

      const resCategorias = await authFetch("/categorias");
      if (resCategorias.ok) setCategorias(await resCategorias.json());

      const resProveedores = await authFetch("/proveedores");
      if (resProveedores.ok) setProveedores(await resProveedores.json());
    } catch (error) {
      setError("Error al cargar datos");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const total = productos.length;
    const activos = productos.filter((p) => p.activo).length;
    const valorTotal = productos.reduce((sum, p) => sum + p.precio_venta, 0);
    setStats({ total, activos, valorTotal });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (producto = null) => {
    if (producto) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio_compra: producto.precio_compra,
        precio_venta: producto.precio_venta,
        fk_categoria: producto.fk_categoria,
        fk_proveedor: producto.fk_proveedor,
        stock_minimo: producto.stock_minimo || "",
        activo: producto.activo,
      });
      setEditingId(producto.id);
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio_compra: "",
        precio_venta: "",
        fk_categoria: "",
        fk_proveedor: "",
        stock_minimo: "",
        activo: true,
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingId ? `/productos/${editingId}` : "/productos";
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar producto");
      }

      setSuccess(
        editingId
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );
      await cargarDatos();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      const res = await authFetch(`/productos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar producto");

      setSuccess("Producto eliminado correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
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
  const totalPages = Math.ceil(productos.length / itemsPerPage);

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
            Productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona y visualiza todos tus productos
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Producto
          </Button>
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <ProductoStats stats={stats} />

      <ProductoTable
        productos={productos}
        categorias={categorias}
        isAdmin={isAdmin}
        handleOpenDialog={handleOpenDialog}
        handleDelete={handleDelete}
        page={page}
        handleChangePage={handleChangePage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />

      <ProductoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        categorias={categorias}
        proveedores={proveedores}
        editingId={editingId}
        error={error}
        success={success}
      />
    </Container>
  );
}

export default Productos;
