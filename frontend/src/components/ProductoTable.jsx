// src/components/ProductoTable.jsx
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

function ProductoTable({
  productos,
  categorias,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
  handleOpenDialog,
  handleDelete,
  handleRestore,
  isAdmin, // Prop existente pero ahora se usa correctamente
}) {
  const startIndex = (page - 1) * itemsPerPage;
  const productosActuales = productos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Precio Compra</TableCell>
              <TableCell align="right">Precio Venta</TableCell>
              {isAdmin && <TableCell align="center">Estado</TableCell>}
              {isAdmin && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {productosActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 5} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay productos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productosActuales.map((producto) => (
                <TableRow
                  key={producto.id}
                  hover
                  sx={{
                    "&:last-child td": { border: 0 },
                    opacity: producto.activo ? 1 : 0.6,
                    backgroundColor: producto.activo
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <TableCell
                    sx={{
                      textDecoration: producto.activo ? "none" : "line-through",
                    }}
                  >
                    {producto.codigo}
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: producto.activo ? "none" : "line-through",
                    }}
                  >
                    <Typography fontWeight="medium">
                      {producto.nombre}
                    </Typography>
                    {producto.descripcion && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {producto.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      textDecoration: producto.activo ? "none" : "line-through",
                    }}
                  >
                    <Chip
                      label={
                        categorias.find((c) => c.id === producto.fk_categoria)
                          ?.nombre || "N/A"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      textDecoration: producto.activo ? "none" : "line-through",
                    }}
                  >
                    ${producto.precio_compra.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      textDecoration: producto.activo ? "none" : "line-through",
                    }}
                    color="primary"
                  >
                    <Typography fontWeight="bold" color="primary">
                      ${producto.precio_venta.toFixed(2)}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Chip
                        label={producto.activo ? "Activo" : "Inactivo"}
                        color={producto.activo ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="center">
                      {producto.activo ? (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(producto)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(producto.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Tooltip title="Restaurar producto">
                          <IconButton
                            color="success"
                            onClick={() => handleRestore(producto.id)}
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

      {productos.length > itemsPerPage && (
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

export default ProductoTable;
