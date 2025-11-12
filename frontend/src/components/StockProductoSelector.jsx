import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Pagination,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

function StockProductoSelector({
  productos,
  selectedProductoId,
  setSelectedProductoId,
  stock,
  isAdmin,
  handleOpenDialog,
  page = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onChangePage,
}) {
  return (
    <Box>
      {/* Selector de Producto */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Buscar Producto"
          value={selectedProductoId}
          onChange={(e) => setSelectedProductoId(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        >
          <MenuItem value="">
            <em>Seleccione un producto</em>
          </MenuItem>
          {productos.map((producto) => (
            <MenuItem key={producto.id} value={producto.id}>
              {producto.codigo} - {producto.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Tabla */}
      {selectedProductoId && (
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.light" }}>
                <TableRow>
                  <TableCell>
                    <InventoryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Producto
                  </TableCell>
                  <TableCell>Almacén</TableCell>
                  <TableCell align="right">Disponible</TableCell>
                  <TableCell align="right">Reservada</TableCell>
                  <TableCell>Última Actualización</TableCell>
                  {isAdmin && <TableCell align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                      <Typography color="text.secondary" py={3}>
                        Este producto no tiene stock en ningún almacén
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stock.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Chip
                          label={item.nombre_producto}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          Almacén #{item.fk_almacen}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight="bold">
                          {item.cantidad_disponible}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="warning.main">
                          {item.cantidad_reservada}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.fecha_ultima_actualizacion || "N/A"}
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalItems > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Pagination
                count={Math.ceil(totalItems / itemsPerPage)}
                page={page}
                onChange={onChangePage}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default StockProductoSelector;
