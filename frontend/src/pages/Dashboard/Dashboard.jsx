import { Box, Container, Typography, Alert } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import StorekeeperDashboard from "./StorekeeperDashboard";
import ProcurementDashboard from "./ProcurementDashboard";
import DepartmentHeadDashboard from "./DepartmentHeadDashboard";
import AuditorDashboard from "./AuditorDashboard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "STOREKEEPER":
        return <StorekeeperDashboard />;
      case "PROCUREMENT_OFFICER":
        return <ProcurementDashboard />;
      case "DEPARTMENT_HEAD":
        return <DepartmentHeadDashboard />;
      case "AUDITOR":
        return <AuditorDashboard />;
      default:
        return (
          <Alert severity="warning">
            No dashboard available for your role: {user?.role}
          </Alert>
        );
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      {renderRoleDashboard()}
    </Container>
  );
};

export default Dashboard;
