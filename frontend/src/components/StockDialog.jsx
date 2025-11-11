import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";

function StockDialog({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  productos,
  almacenes,
  editingId,
  error,
  success,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingId ? "Editar Stock" : "Crear Stock"}</DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="fk_producto"
                label="Producto"
                select
                value={formData.fk_producto}
                onChange={onChange}
                fullWidth
                required
                disabled={editingId} // No permitir cambiar producto al editar
              >
                {productos.map((producto) => (
                  <MenuItem key={producto.id} value={producto.id}>
                    {producto.codigo} - {producto.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="fk_almacen"
                label="Almacén"
                select
                value={formData.fk_almacen}
                onChange={onChange}
                fullWidth
                required
                disabled={editingId} // No permitir cambiar almacén al editar
              >
                {almacenes.map((almacen) => (
                  <MenuItem key={almacen.id} value={almacen.id}>
                    {almacen.nombre} - {almacen.ubicacion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="cantidad_disponible"
                label="Cantidad Disponible"
                type="number"
                value={formData.cantidad_disponible}
                onChange={onChange}
                fullWidth
                required
                inputProps={{ min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="cantidad_reservada"
                label="Cantidad Reservada"
                type="number"
                value={formData.cantidad_reservada}
                onChange={onChange}
                fullWidth
                required
                inputProps={{ min: "0" }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default StockDialog;
