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

function AlmacenTable({
  almacenes,
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
              {isAdmin && <TableCell align="center">Estado</TableCell>}
              {isAdmin && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {almacenesActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 3} align="center">
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
                  sx={{
                    "&:last-child td": { border: 0 },
                    opacity: almacen.activo ? 1 : 0.6,
                    backgroundColor: almacen.activo
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <TableCell
                    sx={{
                      textDecoration: almacen.activo ? "none" : "line-through",
                    }}
                  >
                    <Typography fontWeight="medium">
                      {almacen.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: almacen.activo ? "none" : "line-through",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {almacen.ubicacion}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: almacen.activo ? "none" : "line-through",
                    }}
                  >
                    <Typography variant="body2">
                      {almacen.fecha_creacion || "N/A"}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Chip
                        label={almacen.activo ? "Activo" : "Inactivo"}
                        color={almacen.activo ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="center">
                      {almacen.activo ? (
                        <>
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
                        </>
                      ) : (
                        <Tooltip title="Restaurar almacén">
                          <IconButton
                            color="success"
                            onClick={() => handleRestore(almacen.id)}
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
