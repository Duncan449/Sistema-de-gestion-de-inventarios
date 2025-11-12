import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

function StockDetalladoTable({ stock, isAdmin, handleOpenDialog }) {
  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Almacén</TableCell>
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
                    No hay stock registrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stock.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{item.producto}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.almacen}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="success.main" fontWeight="bold">
                      {item.total_disponible}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="warning.main">
                      {item.total_reservada}
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
    </Paper>
  );
}

export default StockDetalladoTable;
