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
  Pagination,
} from "@mui/material";
import {
  Warehouse as WarehouseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

function StockPorAlmacenSelector({
  almacenes,
  selectedAlmacenId,
  setSelectedAlmacenId,
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
      {/* Selector de Almacén */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Seleccionar Almacén"
          value={selectedAlmacenId}
          onChange={(e) => setSelectedAlmacenId(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        >
          <MenuItem value="">
            <em>Seleccione un almacén</em>
          </MenuItem>
          {almacenes.map((almacen) => (
            <MenuItem key={almacen.id} value={almacen.id}>
              {almacen.nombre} - {almacen.ubicacion}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Tabla */}
      {selectedAlmacenId && (
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.light" }}>
                <TableRow>
                  <TableCell>
                    <WarehouseIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Código
                  </TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Disponible</TableCell>
                  <TableCell align="right">Reservada</TableCell>
                  {isAdmin && <TableCell align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                      <Typography color="text.secondary" py={3}>
                        Este almacén no tiene stock registrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stock.map((item) => (
                    <TableRow key={item.fk_producto} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.codigo_producto}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {item.nombre_producto}
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

export default StockPorAlmacenSelector;
