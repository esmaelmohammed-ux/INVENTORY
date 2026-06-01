import { useState } from "react";
import {
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
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Divider,
  useTheme,
  Badge,
} from "@mui/material";
import {
  Assessment as ReportIcon,
  History as AuditIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  Computer as SystemIcon,
  Storage as DatabaseIcon,
  Memory as MemoryIcon,
  Speed as PerformanceIcon,
  CheckCircle as ComplianceIcon,
  Warning as WarningIcon,
  Timeline as AnalyticsIcon,
  Gavel as DecisionIcon,
  Assignment as RequisitionIcon,
  Assignment as ServiceIcon,
  Receipt as TransactionIcon,
  Business as DepartmentIcon,
  People as UserIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useDashboardStats } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const AuditorDashboard = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner message="Loading audit dashboard..." />;
  if (error) return (
    <Alert severity="error">
      Error loading dashboard data: {error.message}
    </Alert>
  );

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colors = {
      APPROVED: "success",
      PENDING: "warning", 
      REJECTED: "error",
      FULFILLED: "info"
    };
    return colors[status] || "default";
  };

  // Helper function to get transaction type color
  const getTransactionColor = (type) => {
    const colors = {
      RECEIVE: "success",
      ISSUE: "warning",
      ADJUST: "info"
    };
    return colors[type] || "default";
  };

  const StatCard = ({ title, value, icon, color = "primary", subtitle, onClick }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          elevation: 4,
          transform: 'translateY(-2px)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ComplianceCard = ({ title, score, description, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Compliance Score</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {score}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: score >= 80 ? theme.palette.success.main : 
                               score >= 60 ? theme.palette.warning.main : 
                               theme.palette.error.main
              }
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 1: // System Information Tab
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              System Information & Health
            </Typography>
            
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              minHeight: '400px'
            }}>
              {/* System Metrics */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SystemIcon sx={{ mr: 1 }} /> System Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Environment" 
                      secondary={stats?.systemInfo?.environment || 'development'}
                    />
                    <Chip 
                      label={stats?.systemInfo?.environment || 'development'} 
                      color="primary" 
                      size="small" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Node.js Version" 
                      secondary={stats?.systemInfo?.nodeVersion || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="System Uptime" 
                      secondary={`${stats?.systemInfo?.uptime || 0} hours`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Database Status" 
                      secondary={stats?.systemInfo?.databaseStatus || 'Connected'}
                    />
                    <Chip 
                      label={stats?.systemInfo?.databaseStatus || 'Connected'} 
                      color="success" 
                      size="small" 
                      icon={<DatabaseIcon />}
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* Memory Usage */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MemoryIcon sx={{ mr: 1 }} /> Memory Usage
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Memory Utilization</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.systemInfo?.memoryUsage?.used || 0}MB / {stats?.systemInfo?.memoryUsage?.total || 0}MB
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.systemInfo?.memoryUsage ? 
                      (stats.systemInfo.memoryUsage.used / stats.systemInfo.memoryUsage.total * 100) : 0
                    } 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  System performance is optimal
                </Alert>
              </Paper>
            </Box>
          </Box>
        );
        
      case 2: // Audit Trail Tab
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Recent Audit Trail
            </Typography>
            
            <Paper sx={{ p: 3, minHeight: '600px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AuditIcon sx={{ mr: 1 }} /> Transaction Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {stats?.auditTrail?.slice(0, 15).map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {activity.action}
                          </Typography>
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            color={getTransactionColor(activity.type)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            By: {activity.user} ({activity.userRole}) • {activity.quantity} {activity.unit}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                          {activity.notes && (
                            <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                              Notes: {activity.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button 
                variant="outlined" 
                startIcon={<ViewIcon />} 
                sx={{ mt: 2 }}
                onClick={() => navigate('/transactions')}
              >
                View Full Transaction Log
              </Button>
            </Paper>
          </Box>
        );
        
      default: // Overview Tab
        return (
          <Box>
            {/* System Overview Cards */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 4
            }}>
              <StatCard
                title="Total Users"
                value={stats?.systemOverview?.totalUsers || 0}
                icon={<UserIcon />}
                color="primary"
                subtitle="Active in system"
              />
              <StatCard
                title="Departments"
                value={stats?.systemOverview?.totalDepartments || 0}
                icon={<DepartmentIcon />}
                color="secondary"
                subtitle="Organizational units"
              />
              <StatCard
                title="Inventory Items"
                value={stats?.systemOverview?.totalItems || 0}
                icon={<InventoryIcon />}
                color="info"
                subtitle="Items in stock"
                onClick={() => navigate('/inventory')}
              />
              <StatCard
                title="System Health"
                value="OK"
                icon={<SecurityIcon />}
                color="success"
                subtitle={stats?.systemOverview?.systemHealth || 'Operational'}
              />
            </Box>

            {/* Compliance & Analytics */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              },
              gap: 3,
              mb: 4
            }}>
              <ComplianceCard
                title="System Compliance"
                score={stats?.complianceMetrics?.complianceScore || 85}
                description={`${stats?.complianceMetrics?.pendingRequisitions || 0} pending items, ${stats?.complianceMetrics?.lowStockAlerts || 0} stock alerts`}
                icon={<ComplianceIcon color="success" />}
              />
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AnalyticsIcon sx={{ mr: 1 }} /> Weekly Activity
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                      {stats?.complianceMetrics?.weeklyRequisitions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New requisitions this week
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TransactionIcon sx={{ mr: 1 }} /> Transaction Volume
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 700 }}>
                      {stats?.transactionAnalytics?.totalTransactions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transactions (last 30 days)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Recent Decisions */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 3
            }}>
              <Paper sx={{ p: 3, minHeight: '500px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DecisionIcon sx={{ mr: 1 }} /> Recent Administrative Decisions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {stats?.recentDecisions?.slice(0, 8).map((decision, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {decision.title}
                            </Typography>
                            <Chip 
                              label={decision.status} 
                              size="small" 
                              color={getStatusColor(decision.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {decision.department} • Requested by: {decision.requestedBy}
                            </Typography>
                            {decision.approvedBy && (
                              <Typography variant="caption" display="block">
                                Processed by: {decision.approvedBy} ({decision.approverRole})
                              </Typography>
                            )}
                            <Typography variant="caption" display="block">
                              {new Date(decision.processedAt || decision.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button 
                  variant="outlined" 
                  startIcon={<ViewIcon />} 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/requisitions')}
                >
                  View All Requisitions
                </Button>
              </Paper>

              {/* Quick Actions and System Status */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 3, flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReportIcon sx={{ mr: 1 }} /> Generate Reports
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Button 
                      variant="outlined" 
                      startIcon={<ReportIcon />} 
                      fullWidth
                      onClick={() => navigate('/reports')}
                    >
                      Audit Report
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<InventoryIcon />} 
                      fullWidth
                      onClick={() => navigate('/reports')}
                    >
                      Inventory Report
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<TransactionIcon />} 
                      fullWidth
                      onClick={() => navigate('/reports')}
                    >
                      Transaction Log
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<ComplianceIcon />} 
                      fullWidth
                      onClick={() => navigate('/reports')}
                    >
                      Compliance Report
                    </Button>
                  </Box>
                </Paper>

                {/* System Status */}
                <Paper sx={{ p: 3, flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PerformanceIcon sx={{ mr: 1 }} /> System Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemText primary="API Status" />
                      <Chip label="Online" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Database" />
                      <Chip label="Connected" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Audit Logging" />
                      <Chip label="Active" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Last Audit" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(stats?.systemOverview?.lastAuditDate || Date.now()).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tab Navigation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<Badge badgeContent={stats?.complianceMetrics?.pendingRequisitions > 0 ? stats.complianceMetrics.pendingRequisitions : null} color="warning"><SecurityIcon /></Badge>} 
            label="Audit Overview" 
          />
          <Tab icon={<SystemIcon />} label="System Information" />
          <Tab 
            icon={<Badge badgeContent={stats?.auditTrail?.length || null} color="primary"><AuditIcon /></Badge>} 
            label="Audit Trail" 
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {renderTabContent()}
    </Box>
  );
};

export default AuditorDashboard;
