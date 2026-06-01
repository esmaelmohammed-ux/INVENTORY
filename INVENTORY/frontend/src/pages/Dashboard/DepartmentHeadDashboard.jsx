import { useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  RequestQuote as RequisitionIcon,
  Assignment as RequestIcon,
  Group as TeamIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
} from "@mui/icons-material";
import { useDashboardStats, useRequisitions, useServiceRequests } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DepartmentHeadDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats();
  const { data: reqs, isLoading: reqLoading, error: reqError } = useRequisitions({});
  const { data: sreqs, isLoading: sreqLoading, error: sreqError } = useServiceRequests({});

  const currentUserId = user?.id || user?._id || user?.userId;
  const currentUserEmail = user?.email;
  
  const matchesUser = useMemo(() => {
    return (u) => {
      const uid = u?.id || u?._id || u?.userId;
      const email = u?.email;
      return (
        (currentUserId && String(uid) === String(currentUserId)) ||
        (currentUserEmail && email && email.toLowerCase() === currentUserEmail.toLowerCase())
      );
    };
  }, [currentUserId, currentUserEmail]);

  const myRequisitions = useMemo(() => {
    return (reqs || []).filter((r) => matchesUser(r.createdBy));
  }, [reqs, matchesUser]);

  const myServiceRequests = useMemo(() => {
    return (sreqs || []).filter((r) => matchesUser(r.createdBy));
  }, [sreqs, matchesUser]);

  if (statsLoading || reqLoading || sreqLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading dashboard data</div>;

  return (
    <Box>
      {/* Department Overview using CSS Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <RequisitionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {myRequisitions.length + myServiceRequests.length}
            </Typography>
            <Typography color="textSecondary">Total Requests</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <ApprovedIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {myRequisitions.filter((r) => r.status === "APPROVED").length}
            </Typography>
            <Typography color="textSecondary">Approved</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {myRequisitions.filter((r) => r.status === "PENDING").length}
            </Typography>
            <Typography color="textSecondary">Pending</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <TeamIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats?.departmentInfo?.totalMembers || 0}
            </Typography>
            <Typography color="textSecondary">Team Members</Typography>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* My Requests */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              My Recent Requests
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Requisitions */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mt: 2, mb: 1, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              Requisitions
            </Typography>
            {reqError && (
              <Typography variant="caption" color="error">Failed to load requisitions</Typography>
            )}
            <List>
              {myRequisitions.slice(0, 3).map((req, index) => (
                <ListItem key={req.id || req._id || index} divider onClick={() => navigate(`/requisitions/${req.id || req._id}`)} sx={{ cursor: "pointer" }}>
                  <ListItemText
                    primary={req.title}
                    secondary={`${req.items?.length || 0} items • ${new Date(
                      req.createdAt
                    ).toLocaleDateString()}`}
                  />
                  <Chip
                    label={req.status}
                    size="small"
                    color={
                      req.status === "APPROVED"
                        ? "success"
                        : req.status === "PENDING"
                        ? "warning"
                        : "default"
                    }
                  />
                </ListItem>
              ))}
              {myRequisitions.length === 0 && (
                <ListItem>
                  <ListItemText primary="No requisitions yet" />
                </ListItem>
              )}
            </List>

            {/* Service Requests */}
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              Service Requests
            </Typography>
            {sreqError && (
              <Typography variant="caption" color="error">Failed to load service requests</Typography>
            )}
            <List>
              {myServiceRequests.slice(0, 3).map((req, index) => (
                <ListItem key={req.id || req._id || index} divider onClick={() => navigate(`/service-requests/${req.id || req._id}`)} sx={{ cursor: "pointer" }}>
                  <ListItemText
                    primary={req.title}
                    secondary={new Date(req.createdAt).toLocaleDateString()}
                  />
                  <Chip
                    label={req.status}
                    size="small"
                    color={
                      req.status === "APPROVED"
                        ? "success"
                        : req.status === "PENDING"
                        ? "warning"
                        : "default"
                    }
                  />
                </ListItem>
              ))}
              {myServiceRequests.length === 0 && (
                <ListItem>
                  <ListItemText primary="No service requests yet" />
                </ListItem>
              )}
            </List>

            <Button
              variant="contained"
              startIcon={<RequestIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate('/requisitions/new')}
            >
              Create New Request
            </Button>
          </Paper>
        </Grid>

        {/* Team & Quick Actions */}
        <Grid item xs={12} md={3}>
          {/* Department Info */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Department Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" paragraph>
              {stats?.departmentInfo?.name}
            </Typography>
            <Typography variant="body2">
              <strong>{stats?.departmentInfo?.totalMembers}</strong> team
              members
            </Typography>
          </Paper>

          {/* Quick Actions */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="contained" startIcon={<RequestIcon />} fullWidth onClick={() => navigate('/requisitions/new')}>
                New Requisition
              </Button>
              <Button variant="outlined" startIcon={<RequestIcon />} fullWidth onClick={() => navigate('/service-requests/new')}>
                New Service Request
              </Button>
              <Button variant="outlined" startIcon={<TeamIcon />} fullWidth disabled>
                View Team
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepartmentHeadDashboard;
