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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
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
  isAdmin,
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
              <TableCell>
                <InventoryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Código
              </TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Precio Compra</TableCell>
              <TableCell align="right">Precio Venta</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productosActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>{producto.codigo}</TableCell>
                  <TableCell>
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
                  <TableCell>
                    <Chip
                      label={
                        categorias.find((c) => c.id === producto.fk_categoria)
                          ?.nombre || "N/A"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${producto.precio_compra.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" color="primary">
                    <Typography fontWeight="bold" color="primary">
                      ${producto.precio_venta.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={producto.activo ? "Activo" : "Inactivo"}
                      color={producto.activo ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {isAdmin && (
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
                    )}
                  </TableCell>
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
