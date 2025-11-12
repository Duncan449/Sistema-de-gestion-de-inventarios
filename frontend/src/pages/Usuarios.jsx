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
import UsuarioTable from "../components/UsuarioTable";
import UsuarioDialog from "../components/UsuarioDialog";

function Usuarios() {
  const { authFetch, user, isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "empleado",
  });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/usuarios");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();

      // Si es admin, cargar también los usuarios inactivos
      let allUsuarios = data;
      if (isAdmin) {
        const resBorrados = await authFetch("/usuarios/borrados");
        if (resBorrados.ok) {
          const dataBorrados = await resBorrados.json();
          allUsuarios = [...data, ...dataBorrados];
        }
      }

      setUsuarios(allUsuarios);
    } catch (error) {
      setError("Error al cargar usuarios");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: "", // No se muestra la contraseña al editar
        rol: usuario.rol,
      });
      setEditingId(usuario.id);
    } else {
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "empleado",
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
      if (editingId) {
        // Actualizar usuario existente
        const updateData = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
        };

        const res = await authFetch(`/usuarios/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Error al actualizar usuario");
        }

        setSuccess("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        const res = await authFetch("/auth/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Error al crear usuario");
        }

        setSuccess("Usuario creado correctamente");
      }

      await cargarUsuarios();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este usuario?")) return;

    try {
      const res = await authFetch(`/usuarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar usuario");

      setSuccess("Usuario eliminado correctamente");
      await cargarUsuarios();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("¿Está seguro de restaurar este usuario?")) return;

    try {
      const res = await authFetch(`/usuarios/restaurar/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Error al restaurar usuario");

      setSuccess("Usuario restaurado correctamente");
      await cargarUsuarios();
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

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

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
            Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona los usuarios del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nuevo Usuario
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
      <UsuarioTable
        usuarios={usuarios}
        page={page}
        handleChangePage={handleChangePage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        handleOpenDialog={handleOpenDialog}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />

      {/* Dialog */}
      <UsuarioDialog
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

export default Usuarios;
