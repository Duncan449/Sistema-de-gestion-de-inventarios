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
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";

function ProveedorTable({
  proveedores,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
  handleOpenDialog,
  handleDelete,
  handleRestore,
  isAdmin, // Nueva prop
}) {
  const startIndex = (page - 1) * itemsPerPage;
  const proveedoresActuales = proveedores.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Fecha Creación</TableCell>
              {isAdmin && <TableCell align="center">Estado</TableCell>}
              {isAdmin && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedoresActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 5} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay proveedores registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              proveedoresActuales.map((proveedor) => (
                <TableRow
                  key={proveedor.id}
                  hover
                  sx={{
                    "&:last-child td": { border: 0 },
                    opacity: proveedor.activo ? 1 : 0.6,
                    backgroundColor: proveedor.activo
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <TableCell
                    sx={{
                      textDecoration: proveedor.activo
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography fontWeight="medium">
                      {proveedor.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: proveedor.activo
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {proveedor.telefono || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: proveedor.activo
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {proveedor.email || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: proveedor.activo
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography variant="body2">
                      {proveedor.ciudad || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: proveedor.activo
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography variant="body2">
                      {proveedor.fecha_creacion || "N/A"}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Chip
                        label={proveedor.activo ? "Activo" : "Inactivo"}
                        color={proveedor.activo ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="center">
                      {proveedor.activo ? (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(proveedor)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(proveedor.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Tooltip title="Restaurar proveedor">
                          <IconButton
                            color="success"
                            onClick={() => handleRestore(proveedor.id)}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {proveedores.length > itemsPerPage && (
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

export default ProveedorTable;
