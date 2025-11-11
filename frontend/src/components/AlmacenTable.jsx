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
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";

function AlmacenTable({
  almacenes,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
  handleOpenDialog,
  handleDelete,
}) {
  const startIndex = (page - 1) * itemsPerPage;
  const almacenesActuales = almacenes.slice(
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
              <TableCell>Ubicación</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {almacenesActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay almacenes registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              almacenesActuales.map((almacen) => (
                <TableRow
                  key={almacen.id}
                  hover
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>
                    <Typography fontWeight="medium">
                      {almacen.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {almacen.ubicacion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {almacen.fecha_creacion || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={almacen.activo ? "Activo" : "Inactivo"}
                      color={almacen.activo ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(almacen)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(almacen.id)}
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

      {almacenes.length > itemsPerPage && (
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

export default AlmacenTable;
