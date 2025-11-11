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

function MovimientoDialog({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  productos,
  almacenes,
  proveedores,
  error,
  success,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>

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
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="tipo_movimiento"
                label="Tipo de Movimiento"
                select
                value={formData.tipo_movimiento}
                onChange={onChange}
                fullWidth
                required
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="salida">Salida</MenuItem>
                <MenuItem value="ajuste">Ajuste</MenuItem>
                <MenuItem value="devolucion">Devolución</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="cantidad"
                label="Cantidad"
                type="number"
                value={formData.cantidad}
                onChange={onChange}
                fullWidth
                required
                inputProps={{ min: "1" }}
              />
            </Grid>

            {formData.tipo_movimiento === "entrada" && (
              <Grid item xs={12}>
                <TextField
                  name="fk_proveedor"
                  label="Proveedor"
                  select
                  value={formData.fk_proveedor}
                  onChange={onChange}
                  fullWidth
                  required
                >
                  <MenuItem value="">
                    <em>Seleccione un proveedor</em>
                  </MenuItem>
                  {proveedores.map((proveedor) => (
                    <MenuItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                name="motivo"
                label="Motivo / Observaciones"
                value={formData.motivo}
                onChange={onChange}
                fullWidth
                multiline
                rows={3}
                helperText="Describa el motivo del movimiento"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Registrar Movimiento
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MovimientoDialog;
