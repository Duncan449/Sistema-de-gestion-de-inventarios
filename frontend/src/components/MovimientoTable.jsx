import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Pagination,
  Paper,
} from "@mui/material";

function MovimientoTable({
  movimientos,
  productos,
  almacenes,
  page,
  totalPages,
  itemsPerPage,
  handleChangePage,
}) {
  const startIndex = (page - 1) * itemsPerPage;
  const movimientosActuales = movimientos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getProductoNombre = (fk_producto) => {
    const producto = productos.find((p) => p.id === fk_producto);
    return producto ? producto.nombre : "Desconocido";
  };

  const getAlmacenNombre = (fk_almacen) => {
    const almacen = almacenes.find((a) => a.id === fk_almacen);
    return almacen ? almacen.nombre : "Desconocido";
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "entrada":
        return "success";
      case "salida":
        return "error";
      case "ajuste":
        return "warning";
      case "devolucion":
        return "info";
      default:
        return "default";
    }
  };

  const formatearTipo = (tipo) => {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Almacén</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Stock Anterior</TableCell>
              <TableCell align="right">Stock Nuevo</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientosActuales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay movimientos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              movimientosActuales.map((movimiento) => (
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {getProductoNombre(movimiento.fk_producto)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getAlmacenNombre(movimiento.fk_almacen)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatearTipo(movimiento.tipo_movimiento)}
                      size="small"
                      color={getTipoColor(movimiento.tipo_movimiento)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="primary">
                      {movimiento.cantidad}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {movimiento.cantidad_anterior}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {movimiento.cantidad_nueva}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {movimiento.motivo || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {movimiento.fecha_movimiento}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {movimientos.length > itemsPerPage && (
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

export default MovimientoTable;
