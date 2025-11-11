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
import MovimientoTable from "../components/MovimientoTable";
import MovimientoDialog from "../components/MovimientoDialog";

function MovimientosInventario() {
  const { authFetch, user, isAdmin } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    entradas: 0,
    salidas: 0,
    ajustes: 0,
  });

  const [formData, setFormData] = useState({
    fk_producto: "",
    fk_almacen: "",
    tipo_movimiento: "",
    cantidad: "",
    motivo: "",
    fk_usuario: "",
    fk_proveedor: "",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      // Si es admin, carga todos los movimientos
      // Si es usuario normal, solo carga sus movimientos
      const movimientosEndpoint = isAdmin
        ? "/movimientos"
        : `/movimientos/usuario/${user?.id}`;

      const [resMovimientos, resProductos, resAlmacenes, resProveedores] =
        await Promise.all([
          authFetch(movimientosEndpoint),
          authFetch("/productos"),
          authFetch("/almacenes"),
          authFetch("/proveedores"),
        ]);

      if (resMovimientos.ok) setMovimientos(await resMovimientos.json());
      if (resProductos.ok) setProductos(await resProductos.json());
      if (resAlmacenes.ok) setAlmacenes(await resAlmacenes.json());
      if (resProveedores.ok) setProveedores(await resProveedores.json());
    } catch (error) {
      setError("Error al cargar datos");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = () => {
    setFormData({
      fk_producto: "",
      fk_almacen: "",
      tipo_movimiento: "",
      cantidad: "",
      motivo: "",
      fk_usuario: user?.id || "",
      fk_proveedor: "",
    });
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      // Validar que si es entrada, tenga proveedor
      if (formData.tipo_movimiento === "entrada" && !formData.fk_proveedor) {
        setError("Las entradas deben tener un proveedor asociado");
        return;
      }

      // Asegurarse de que fk_usuario esté presente
      const dataToSend = {
        ...formData,
        fk_usuario: user?.id,
        cantidad: parseInt(formData.cantidad),
        fk_proveedor:
          formData.tipo_movimiento === "entrada"
            ? parseInt(formData.fk_proveedor)
            : null,
      };

      const res = await authFetch("/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log("Error data:", errorData); // <--- agregar esta línea
        throw new Error(errorData.detail || "Error al registrar movimiento");
      }

      setSuccess("Movimiento registrado correctamente");
      await cargarDatosIniciales();
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

  const totalPages = Math.ceil(movimientos.length / itemsPerPage);

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
            {isAdmin ? "Movimientos de Inventario" : "Mis Movimientos"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin
              ? "Registra y visualiza todas las transacciones de inventario"
              : "Registra y visualiza tus transacciones de inventario"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2 }}
        >
          Nuevo Movimiento
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
      <MovimientoTable
        movimientos={movimientos}
        productos={productos}
        almacenes={almacenes}
        page={page}
        handleChangePage={handleChangePage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />

      {/* Dialog */}
      <MovimientoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        productos={productos}
        almacenes={almacenes}
        proveedores={proveedores}
        error={error}
        success={success}
      />
    </Container>
  );
}

export default MovimientosInventario;
