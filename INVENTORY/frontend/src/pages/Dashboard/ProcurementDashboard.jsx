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
  Divider,
} from "@mui/material";
import {
  RequestQuote as RequisitionIcon,
  Assignment as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  TrendingUp as StatsIcon,
} from "@mui/icons-material";
import { useDashboardStats, useRequisitions, useServiceRequests, useServiceRequestStats } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: pendingRequisitions = [], isLoading: prLoading } = useRequisitions({ status: "PENDING" });
  const { data: pendingServiceRequests = [], isLoading: psrLoading } = useServiceRequests({ status: "PENDING" });
  const { data: sReqStats } = useServiceRequestStats();
  // recent decisions from service requests (approved/rejected)
  const { data: sReqApproved = [] } = useServiceRequests({ status: "APPROVED" });
  const { data: sReqRejected = [] } = useServiceRequests({ status: "REJECTED" });

  if (isLoading || prLoading || psrLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading dashboard data</div>;

    
  return (
    <Box>
      {/* Approval Stats using CSS Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.pendingApprovals?.requisitions || 0}</Typography>
            <Typography color="textSecondary">Pending Requisitions</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PendingIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.pendingApprovals?.serviceRequests || 0}</Typography>
            <Typography color="textSecondary">Pending Service Requests</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ApprovedIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.requisitions?.APPROVED || 0}</Typography>
            <Typography color="textSecondary">Requisitions Approved</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <RejectedIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.requisitions?.REJECTED || 0}</Typography>
            <Typography color="textSecondary">Requisitions Rejected</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Service Request Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ApprovedIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{sReqStats?.APPROVED || 0}</Typography>
            <Typography color="textSecondary">Service Requests Approved</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <RejectedIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{sReqStats?.REJECTED || 0}</Typography>
            <Typography color="textSecondary">Service Requests Rejected</Typography>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* Pending Requisitions */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending Requisitions</Typography>
              <Chip label={`${pendingRequisitions.length} pending`} color="warning" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
              {pendingRequisitions.slice(0, 5).map((req, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={req.title}
                    secondary={`${req.department?.name || req.department || ''} • ${(req.items?.length || req.items || 0)} items • ${new Date(req.createdAt).toLocaleDateString()}`}
                  />
                  <Button size="small" variant="outlined" onClick={() => navigate(`/requisitions/${req.id || req._id}`)}>
                    Review
                  </Button>
                </ListItem>
              ))}
            </List>

            {pendingRequisitions.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No pending requisitions
              </Typography>
            )}

            {pendingRequisitions.length > 0 && (
              <Divider sx={{ mt: 1, mb: 1 }} />
            )}
            {pendingRequisitions.length > 0 && (
              <Button fullWidth variant="text" onClick={() => navigate('/requisitions')}>
                View All Requisitions
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Pending Service Requests */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending Service Requests</Typography>
              <Chip label={`${pendingServiceRequests.length} pending`} color="info" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
              {pendingServiceRequests.slice(0, 5).map((req, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={req.title}
                    secondary={`${req.department?.name || req.department || ''} • ${new Date(req.createdAt).toLocaleDateString()}`}
                  />
                  <Button size="small" variant="outlined" onClick={() => navigate(`/service-requests/${req.id || req._id}`)}>
                    Review
                  </Button>
                </ListItem>
              ))}
            </List>

            {pendingServiceRequests.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No pending service requests
              </Typography>
            )}

            {pendingServiceRequests.length > 0 && (
              <Divider sx={{ mt: 1, mb: 1 }} />
            )}
            {pendingServiceRequests.length > 0 && (
              <Button fullWidth variant="text" onClick={() => navigate('/service-requests')}>
                View All Service Requests
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Decisions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Decisions
        </Typography>
        {(() => {
          const mapReqDecisions = (list = []) =>
            list.map((d) => ({
              title: d.title,
              department: d.department?.name || d.department || "",
              processedBy:
                d.processedBy?.firstName
                  ? `${d.processedBy.firstName} ${d.processedBy.lastName || ""}`.trim()
                  : d.processedBy || "",
              status: d.status,
              time: d.processedAt || d.createdAt,
            }));
          const reqDecisions = mapReqDecisions(stats?.recentDecisions || []);
          const sDecisions = mapReqDecisions([...(sReqApproved || []), ...(sReqRejected || [])]);
          const combined = [...reqDecisions, ...sDecisions]
            .filter((d) => d.status === "APPROVED" || d.status === "REJECTED")
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 4);
          return (
            <Grid container spacing={2}>
              {combined.map((decision, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor:
                        decision.status === "APPROVED"
                          ? "success.light"
                          : "error.light",
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {decision.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {decision.department} • {decision.processedBy}
                    </Typography>
                    <Chip
                      label={decision.status}
                      size="small"
                      color={decision.status === "APPROVED" ? "success" : "error"}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              ))}
              {combined.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No recent decisions</Typography>
                </Grid>
              )}
            </Grid>
          );
        })()}
      </Paper>
    </Box>
  );
};

export default ProcurementDashboard;
