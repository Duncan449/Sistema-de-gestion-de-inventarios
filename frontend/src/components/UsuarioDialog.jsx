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

function UsuarioDialog({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  editingId,
  error,
  success,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingId ? "Editar Usuario" : "Nuevo Usuario"}
      </DialogTitle>

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
                name="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            {!editingId && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  fullWidth
                  required
                  helperText="Mínimo 6 caracteres"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                name="rol"
                label="Rol"
                select
                value={formData.rol}
                onChange={onChange}
                fullWidth
                required
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="empleado">Empleado</MenuItem>
              </TextField>
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

export default UsuarioDialog;
