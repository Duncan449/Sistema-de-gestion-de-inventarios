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
import AlmacenTable from "../components/AlmacenTable";
import AlmacenDialog from "../components/AlmacenDialog";

function Almacenes() {
  const { authFetch, isAdmin } = useAuth(); // Agregar isAdmin
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    activo: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarAlmacenes();
  }, []);

  const cargarAlmacenes = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/almacenes");
      if (!res.ok) throw new Error("Error al cargar almacenes");
      const data = await res.json();

      // Si es admin, cargar también los almacenes inactivos
      let allAlmacenes = data;
      if (isAdmin) {
        const resBorrados = await authFetch("/almacenes/borrados");
        if (resBorrados.ok) {
          const dataBorrados = await resBorrados.json();
          allAlmacenes = [...data, ...dataBorrados];
        }
      }

      setAlmacenes(allAlmacenes);
    } catch (error) {
      setError("Error al cargar almacenes");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (almacen = null) => {
    if (almacen) {
      setFormData({
        nombre: almacen.nombre,
        ubicacion: almacen.ubicacion,
        activo: almacen.activo,
      });
      setEditingId(almacen.id);
    } else {
      setFormData({
        nombre: "",
        ubicacion: "",
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
      const url = editingId ? `/almacenes/${editingId}` : "/almacenes";
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar almacén");
      }

      setSuccess(
        editingId
          ? "Almacén actualizado correctamente"
          : "Almacén creado correctamente"
      );
      await cargarAlmacenes();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este almacén?")) return;

    try {
      const res = await authFetch(`/almacenes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar almacén");

      setSuccess("Almacén eliminado correctamente");
      await cargarAlmacenes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("¿Está seguro de restaurar este almacén?")) return;

    try {
      const res = await authFetch(`/almacenes/restaurar/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Error al restaurar almacén");

      setSuccess("Almacén restaurado correctamente");
      await cargarAlmacenes();
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

  const totalPages = Math.ceil(almacenes.length / itemsPerPage);

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
            Almacenes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin
              ? "Gestiona los almacenes del sistema"
              : "Visualiza los almacenes del sistema"}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Almacén
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

      {/* Tabla */}
      <AlmacenTable
        almacenes={almacenes}
        page={page}
        handleChangePage={handleChangePage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        handleOpenDialog={handleOpenDialog}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        isAdmin={isAdmin} // Pasar la prop isAdmin
      />

      {/* Dialog - solo para admin */}
      {isAdmin && (
        <AlmacenDialog
          open={openDialog}
          onClose={handleCloseDialog}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          editingId={editingId}
          error={error}
          success={success}
        />
      )}
    </Container>
  );
}

export default Almacenes;
