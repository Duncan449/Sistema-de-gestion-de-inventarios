// src/components/ProductoStats.jsx
import { Grid, Card, CardContent, Typography } from "@mui/material";

function ProductoStats({ stats }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary">Total Productos</Typography>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ProductoStats;
