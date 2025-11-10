import { Card, CardContent, Typography, Chip } from "@mui/material";

function ProductoCard({ producto }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {producto.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Código: {producto.codigo}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          ${producto.precio_venta.toFixed(2)}
        </Typography>
        <Chip
          label={producto.activo ? "Activo" : "Inactivo"}
          color={producto.activo ? "success" : "error"}
          size="small"
        />
      </CardContent>
    </Card>
  );
}

export default ProductoCard;
