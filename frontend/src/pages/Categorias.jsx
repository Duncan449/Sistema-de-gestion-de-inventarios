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
import CategoriaTable from "../components/CategoriaTable";
import CategoriaDialog from "../components/CategoriaDialog";

function Categorias() {
  const { authFetch } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activa: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/categorias");
      if (!res.ok) throw new Error("Error al cargar categorías");
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      setError("Error al cargar categorías");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (categoria = null) => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || "",
        activa: categoria.activa,
      });
      setEditingId(categoria.id);
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        activa: true,
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingId ? `/categorias/${editingId}` : "/categorias";
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar categoría");
      }

      setSuccess(
        editingId
          ? "Categoría actualizada correctamente"
          : "Categoría creada correctamente"
      );
      await cargarCategorias();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría?")) return;

    try {
      const res = await authFetch(`/categorias/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar categoría");

      setSuccess("Categoría eliminada correctamente");
      await cargarCategorias();
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

  const totalPages = Math.ceil(categorias.length / itemsPerPage);

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
            Categorías
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona las categorías de productos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nueva Categoría
        </Button>
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

      {/* Tabla */}
      <CategoriaTable
        categorias={categorias}
        page={page}
        handleChangePage={handleChangePage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        handleOpenDialog={handleOpenDialog}
        handleDelete={handleDelete}
      />

      {/* Dialog */}
      <CategoriaDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        editingId={editingId}
        error={error}
        success={success}
      />
    </Container>
  );
}

export default Categorias;
