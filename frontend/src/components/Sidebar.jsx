import {
  Drawer,
  Box,
  Button,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  AllInbox as AllInboxIcon,
  ManageAccounts as ManageAccountsIcon,
  SwapHoriz as SwapHorizIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Sidebar({ handleLogout }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <Drawer
      variant="permanent"
      open={true}
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          paddingTop: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          borderRight: "none",
        },
      }}
    >
      {/* Parte superior */}
      <Box>
        <Container>
          {/* Título del Sidebar */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
              color: "primary.contrastText",
              letterSpacing: 1,
            }}
          >
            INVENTARIO
          </Typography>

          <Divider
            sx={{
              mb: 2,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />

          {/* Botones de navegación */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <SidebarButton
              icon={<DashboardIcon />}
              label="Dashboard"
              onClick={() => navigate("/dashboard")}
            />
            <SidebarButton
              icon={<InventoryIcon />}
              label="Productos"
              onClick={() => navigate("/productos")}
            />
            <SidebarButton
              icon={<AllInboxIcon />}
              label="Stock Almacén"
              onClick={() => navigate("/stock-almacen")}
            />
            <SidebarButton
              icon={<SwapHorizIcon />}
              label="Movimientos"
              onClick={() => navigate("/movimientos")}
            />

            {isAdmin && (
              <>
                <SidebarButton
                  icon={<WarehouseIcon />}
                  label="Almacenes"
                  onClick={() => navigate("/almacenes")}
                />
                <SidebarButton
                  icon={<CategoryIcon />}
                  label="Categorías"
                  onClick={() => navigate("/categorias")}
                />
                <SidebarButton
                  icon={<PeopleIcon />}
                  label="Proveedores"
                  onClick={() => navigate("/proveedores")}
                />
                <SidebarButton
                  icon={<ManageAccountsIcon />}
                  label="Usuarios"
                  onClick={() => navigate("/usuarios")}
                />
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Parte inferior (logout fijo) */}
      <Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 1 }} />
        <Container>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              color: "primary.contrastText",
              justifyContent: "center",
            }}
          >
            Cerrar Sesión
          </Button>
        </Container>
      </Box>
    </Drawer>
  );
}

/* Componente reutilizable para los botones */
function SidebarButton({ icon, label, onClick }) {
  return (
    <Button
      startIcon={icon}
      onClick={onClick}
      fullWidth
      sx={{
        color: "primary.contrastText",
        justifyContent: "flex-start",
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 2,
        px: 1,
        py: 1.5,
        "& .MuiSvgIcon-root": { fontSize: 25 },
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.15)",
          transition: "all 0.2s ease",
        },
      }}
    >
      {label}
    </Button>
  );
}

export default Sidebar;
