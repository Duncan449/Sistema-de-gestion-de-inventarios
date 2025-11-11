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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

function ProveedorTable({
  proveedores,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
  handleOpenDialog,
  handleDelete,
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
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedoresActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>
                    <Typography fontWeight="medium">
                      {proveedor.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {proveedor.telefono || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {proveedor.email || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {proveedor.ciudad || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {proveedor.fecha_creacion || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={proveedor.activo ? "Activo" : "Inactivo"}
                      color={proveedor.activo ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
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
                  </TableCell>
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
