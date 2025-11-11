import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Box,
  Pagination,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function UsuarioTable({
  usuarios,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
  handleOpenDialog,
  handleDelete,
  currentUserId,
}) {
  const startIndex = (page - 1) * itemsPerPage;
  const usuariosActuales = usuarios.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return fecha;
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell>Última Sesión</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay usuarios registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuariosActuales.map((usuario) => (
                <TableRow
                  key={usuario.id}
                  hover
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>
                    <Typography fontWeight="medium">
                      {usuario.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {usuario.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        usuario.rol === "admin" ? "Administrador" : "Empleado"
                      }
                      size="small"
                      color={usuario.rol === "admin" ? "primary" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatearFecha(usuario.fecha_creacion)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatearFecha(usuario.fecha_ultima_sesion)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={usuario.activo ? "Activo" : "Inactivo"}
                      color={usuario.activo ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(usuario)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {usuario.id !== currentUserId && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(usuario.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {usuarios.length > itemsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
}

export default UsuarioTable;
