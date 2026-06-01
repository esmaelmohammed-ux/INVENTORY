import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  RequestQuote as RequisitionIcon,
  Assignment as ServiceRequestIcon,
  Assessment as ReportIcon,
  People as UserIcon,
  Settings as SettingsIcon,
  History as TransactionIcon,
  HomeWork as HomeWorkIcon,
  Business as BusinessIcon,
  AccountCircle as ProfileIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    roles: [
      "ADMIN",
      "STOREKEEPER",
      "PROCUREMENT_OFFICER",
      "DEPARTMENT_HEAD",
      "AUDITOR",
    ],
  },
  {
    text: "User Management",
    icon: <UserIcon />,
    path: "/users",
    roles: ["ADMIN"],
  },
  {
    text: "Department Management",
    icon: <BusinessIcon />,
    path: "/departments",
    roles: ["ADMIN"],
  },
  {
    text: "Inventory",
    icon: <InventoryIcon />,
    path: "/inventory",
    roles: ["STOREKEEPER", "PROCUREMENT_OFFICER", "DEPARTMENT_HEAD", "AUDITOR"],
  },
  {
    text: "My Requisitions",
    icon: <RequisitionIcon />,
    path: "/my-requisitions",
    roles: ["DEPARTMENT_HEAD"],
  },
  {
    text: "Requisitions",
    icon: <RequisitionIcon />,
    path: "/requisitions",
    roles: ["PROCUREMENT_OFFICER", "AUDITOR"],
  },
  {
    text: "Fulfill Requisitions",
    icon: <RequisitionIcon />,
    path: "/requisitions/fulfill",
    roles: ["STOREKEEPER"],
  },
  {
    text: "My Service Requests",
    icon: <ServiceRequestIcon />,
    path: "/my-service-requests",
    roles: ["DEPARTMENT_HEAD"],
  },
  {
    text: "Service Requests",
    icon: <ServiceRequestIcon />,
    path: "/service-requests",
    roles: ["PROCUREMENT_OFFICER", "AUDITOR"],
  },
  {
    text: "Transactions",
    icon: <TransactionIcon />,
    path: "/transactions",
    roles: ["ADMIN", "STOREKEEPER", "AUDITOR"],
  },
  {
    text: "Reports",
    icon: <ReportIcon />,
    path: "/reports",
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "AUDITOR"],
  },
];

const Sidebar = ({ open, onClose, isMobile, userRole, user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = 280;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleProfileClick = () => {
    navigate('/profile');
    if (isMobile) {
      onClose();
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "error",
      STOREKEEPER: "warning", 
      PROCUREMENT_OFFICER: "info",
      DEPARTMENT_HEAD: "success",
      AUDITOR: "secondary",
    };
    return colors[role] || "default";
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, textAlign: "left" }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <HomeWorkIcon
            sx={{ fontSize: 40, color: theme.palette.primary.main }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Inventory
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : theme.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* User Profile Section at Bottom */}
      <Box sx={{ mt: 'auto', p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItemButton
          onClick={handleProfileClick}
          sx={{
            borderRadius: 2,
            p: 1.5,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: '1rem',
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email}
              </Typography>
              <Chip
                label={user?.role?.replace("_", " ") || "User"}
                color={getRoleColor(user?.role)}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
              />
            </Box>
            
            <ProfileIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
          </Box>
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
