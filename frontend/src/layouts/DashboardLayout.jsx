import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import { Box } from "@mui/material";

function DashboardLayout({ children }) {
  const { logout } = useAuth();

  const handleLogout = () => logout();

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar handleLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
