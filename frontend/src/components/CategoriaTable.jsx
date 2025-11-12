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

function CategoriaTable({
  categorias,
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
  const categoriasActuales = categorias.slice(
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
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha Creación</TableCell>
              {isAdmin && <TableCell align="center">Estado</TableCell>}
              {isAdmin && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriasActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 3} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay categorías registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categoriasActuales.map((categoria) => (
                <TableRow
                  key={categoria.id}
                  hover
                  sx={{
                    "&:last-child td": { border: 0 },
                    opacity: categoria.activa ? 1 : 0.6,
                    backgroundColor: categoria.activa
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <TableCell
                    sx={{
                      textDecoration: categoria.activa
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography fontWeight="medium">
                      {categoria.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: categoria.activa
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {categoria.descripcion || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: categoria.activa
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <Typography variant="body2">
                      {categoria.fecha_creacion || "N/A"}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Chip
                        label={categoria.activa ? "Activa" : "Inactiva"}
                        color={categoria.activa ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="center">
                      {categoria.activa ? (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(categoria)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(categoria.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Tooltip title="Restaurar categoría">
                          <IconButton
                            color="success"
                            onClick={() => handleRestore(categoria.id)}
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

      {categorias.length > itemsPerPage && (
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

export default CategoriaTable;
