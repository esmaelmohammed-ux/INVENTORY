import { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuClick={handleSidebarToggle} />

      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        isMobile={isMobile}
        userRole={user?.role}
        user={user}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          ml: { md: "280px" },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
