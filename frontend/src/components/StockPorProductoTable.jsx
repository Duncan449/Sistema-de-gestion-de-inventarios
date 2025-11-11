import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

function StockPorProductoTable({ stock, productos }) {
  const getProductoNombre = (fk_producto) => {
    const producto = productos.find((p) => p.id === fk_producto);
    return producto ? producto.nombre : "Desconocido";
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">
                Total Disponible (todos los almacenes)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay stock registrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stock.map((item) => (
                <TableRow key={item.fk_producto} hover>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {getProductoNombre(item.fk_producto)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {item.total_disponible}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default StockPorProductoTable;
