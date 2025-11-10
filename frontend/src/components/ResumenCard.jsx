import { Card, CardContent, Typography, Divider } from "@mui/material";

function ResumenCard({ title, value, color = "text.primary", description }) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={color} sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ResumenCard;
