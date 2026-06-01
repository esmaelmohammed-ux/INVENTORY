import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  History as AuditIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Assignment as TaskIcon,
  AccountBox as UserIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { 
  useTransactions, 
  useTransactionStats, 
  useAuditLogs, 
  useAuditStats 
} from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import TransactionDetail from "./TransactionDetail";
import { useAuth } from "../../contexts/AuthContext";

const TransactionList = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30days");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Audit log specific filters
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [auditEntityFilter, setAuditEntityFilter] = useState("all");

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);

  const queryParams = useMemo(() => {
    const sort = sortModel?.[0];
    return {
      search: searchTerm || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      page: paginationModel.page + 1, // assuming API is 1-based
      pageSize: paginationModel.pageSize,
      sortField: sort?.field,
      sortOrder: sort?.sort,
    };
  }, [searchTerm, typeFilter, paginationModel, sortModel]);

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useTransactions(queryParams);

  const { data: stats } = useTransactionStats({
    timeframe: dateRange,
  });
  
  // Audit log queries (only for ADMIN and AUDITOR)
  const auditQueryParams = useMemo(() => ({
    action: auditActionFilter !== "all" ? auditActionFilter : undefined,
    entityType: auditEntityFilter !== "all" ? auditEntityFilter : undefined,
    startDate: dateRange === "7days" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
              dateRange === "30days" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
              dateRange === "90days" ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() :
              undefined,
    page: 1,
    limit: 100
  }), [auditActionFilter, auditEntityFilter, dateRange]);
  
  const {
    data: auditLogsData,
    isLoading: auditLoading,
    error: auditError,
    refetch: refetchAuditLogs
  } = useAuditLogs(auditQueryParams, {
    enabled: user?.role === 'ADMIN' || user?.role === 'AUDITOR'
  });
  
  const {
    data: auditStats,
  } = useAuditStats({ 
    startDate: auditQueryParams.startDate 
  }, {
    enabled: user?.role === 'ADMIN' || user?.role === 'AUDITOR'
  });

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination || {};
  const rowCount = pagination.totalCount ?? transactionsData?.totalCount ?? 0;

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedTransaction(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      RECEIVE: "success",
      ISSUE: "error",
      ADJUST: "warning",
    };
    return colors[type] || "default";
  };

  const getTypeIcon = (type) => {
    const icons = {
      RECEIVE: "📥",
      ISSUE: "📤",
      ADJUST: "⚙️",
    };
    return icons[type] || "📋";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setDateRange("30days");
  };

  const columns = [
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTypeColor(params.value)}
          size="small"
          icon={<span>{getTypeIcon(params.value)}</span>}
          sx={{
            fontWeight: 600,
            minWidth: 90,
          }}
        />
      ),
    },
    {
      field: "item",
      headerName: "Item",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InventoryIcon color="primary" fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="600">
              {params.value.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.value.category?.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor:
              params.row.type === "ISSUE"
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.success.main, 0.1),
            px: 1.5,
            py: 0.5,
            borderRadius: 4,
          }}
        >
          <Typography
            variant="body2"
            color={params.row.type === "ISSUE" ? "error.main" : "success.main"}
            fontWeight="700"
          >
            {params.row.type === "ISSUE" ? "-" : "+"}
            {Math.abs(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.item?.unit}
          </Typography>
        </Box>
      ),
    },
    {
      field: "user",
      headerName: "Performed By",
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon fontSize="small" color="primary" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.value.firstName} {params.value.lastName}
            </Typography>
            <Chip
              label={params.value.role}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date & Time",
      flex: 1.2,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleViewDetails(params.row)}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading transactions..." />;
  if (error) return <div>Error loading transactions: {error.message}</div>;

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            gutterBottom
            color="primary"
          >
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track all inventory movements and adjustments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ borderRadius: 2 }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  mb: 2,
                }}
              >
                <ReceiptIcon fontSize="medium" />
              </Box>
              <Typography
                variant="h3"
                fontWeight="700"
                color="primary"
                gutterBottom
              >
                {stats?.summary?.totalTransactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {stats?.byType?.map((typeStat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: alpha(
                      theme.palette[getTypeColor(typeStat.type)].main,
                      0.1
                    ),
                    color: `${getTypeColor(typeStat.type)}.main`,
                    mb: 2,
                  }}
                >
                  <TrendingIcon fontSize="medium" />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight="700"
                  color={`${getTypeColor(typeStat.type)}.main`}
                  gutterBottom
                >
                  {typeStat.count}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {typeStat.type} Transactions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {typeStat.totalQuantity} units
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<ReceiptIcon />} 
            label="Transactions" 
            sx={{ fontWeight: 600 }}
          />
          {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') && (
            <Tab 
              icon={
                <Badge 
                  badgeContent={auditLogsData?.logs?.length || null} 
                  color="primary"
                >
                  <AuditIcon />
                </Badge>
              } 
              label="Audit Trail" 
              sx={{ fontWeight: 600 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterIcon fontSize="small" /> Filters & Search
          </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search transactions by item, user, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={typeFilter}
                label="Transaction Type"
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="RECEIVE">Receive</MenuItem>
                <MenuItem value="ISSUE">Issue</MenuItem>
                <MenuItem value="ADJUST">Adjust</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={dateRange}
                label="Time Range"
                onChange={(e) => setDateRange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ borderRadius: 2, height: "40px" }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>
      )}

      {/* Audit Trail Filters */}
      {activeTab === 1 && (user?.role === 'ADMIN' || user?.role === 'AUDITOR') && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <SecurityIcon fontSize="small" /> Audit Trail Filters
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={auditActionFilter}
                  label="Action Type"
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                  <MenuItem value="LOGIN">Login</MenuItem>
                  <MenuItem value="APPROVE">Approve</MenuItem>
                  <MenuItem value="REJECT">Reject</MenuItem>
                  <MenuItem value="ADJUST">Adjust</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={auditEntityFilter}
                  label="Entity Type"
                  onChange={(e) => setAuditEntityFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Entities</MenuItem>
                  <MenuItem value="Transaction">Transactions</MenuItem>
                  <MenuItem value="Item">Items</MenuItem>
                  <MenuItem value="User">Users</MenuItem>
                  <MenuItem value="Requisition">Requisitions</MenuItem>
                  <MenuItem value="ServiceRequest">Service Requests</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Time Range"
                  onChange={(e) => setDateRange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setAuditActionFilter("all");
                  setAuditEntityFilter("all");
                  setDateRange("30days");
                }}
                startIcon={<ClearIcon />}
                size="small"
                sx={{ borderRadius: 2, height: "40px" }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Transactions Data Grid */}
      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            height: 600,
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <DataGrid
            rows={transactions}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            loading={isLoading}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 0,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
              },
            }}
          />
        </Paper>
      )}

      {/* Audit Trail View */}
      {activeTab === 1 && (user?.role === 'ADMIN' || user?.role === 'AUDITOR') && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {/* Audit Stats Summary */}
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SecurityIcon /> Audit Trail Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="700">
                    {auditStats?.totalLogs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Audit Logs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="700">
                    {auditStats?.uniqueUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="700">
                    {auditStats?.criticalActions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Actions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight="700">
                    {auditStats?.todayLogs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Activity
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Audit Logs List */}
          <Box sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <AuditIcon /> Recent Audit Activity
            </Typography>
            
            {auditLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <LoadingSpinner message="Loading audit logs..." />
              </Box>
            )}
            
            {auditError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading audit logs: {auditError.message}
              </Alert>
            )}

            {auditLogsData?.logs && auditLogsData.logs.length > 0 ? (
              <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
                {auditLogsData.logs.map((log, index) => {
                  const getActionIcon = (action) => {
                    switch (action) {
                      case 'CREATE': return <TaskIcon color="success" />;
                      case 'UPDATE': return <AnalyticsIcon color="info" />;
                      case 'DELETE': return <ErrorIcon color="error" />;
                      case 'LOGIN': return <UserIcon color="primary" />;
                      case 'APPROVE': return <SuccessIcon color="success" />;
                      case 'REJECT': return <ErrorIcon color="error" />;
                      case 'ADJUST': return <WarningIcon color="warning" />;
                      default: return <TaskIcon />;
                    }
                  };

                  const getActionColor = (action) => {
                    switch (action) {
                      case 'CREATE': return 'success';
                      case 'UPDATE': return 'info';
                      case 'DELETE': return 'error';
                      case 'LOGIN': return 'primary';
                      case 'APPROVE': return 'success';
                      case 'REJECT': return 'error';
                      case 'ADJUST': return 'warning';
                      default: return 'default';
                    }
                  };

                  return (
                    <ListItem 
                      key={log.id} 
                      divider={index < auditLogsData.logs.length - 1}
                      sx={{ 
                        py: 2, 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.02) 
                        } 
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 56 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: alpha(theme.palette[getActionColor(log.action)].main, 0.1),
                            color: `${getActionColor(log.action)}.main`,
                            width: 40,
                            height: 40
                          }}
                        >
                          {getActionIcon(log.action)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {log.action} {log.entityType}
                            </Typography>
                            <Chip 
                              label={log.action} 
                              size="small" 
                              color={getActionColor(log.action)}
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary" gutterBottom>
                              {log.details || `${log.action.toLowerCase()} operation on ${log.entityType.toLowerCase()}`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon fontSize="small" />
                                {log.user?.firstName} {log.user?.lastName} ({log.user?.role})
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ReceiptIcon fontSize="small" />
                                Entity ID: {log.entityId}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(log.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            {log.metadata && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block', 
                                  mt: 0.5, 
                                  fontStyle: 'italic',
                                  color: 'text.secondary'
                                }}
                              >
                                Additional: {JSON.stringify(log.metadata, null, 2)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No audit logs found for the selected criteria.
              </Alert>
            )}

            {auditLogsData?.logs && auditLogsData.logs.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {auditLogsData.logs.length} of {auditLogsData.pagination?.totalCount || auditLogsData.logs.length} audit logs
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => refetchAuditLogs()}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Transaction Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReceiptIcon />
          Transaction Details
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTransaction && (
            <TransactionDetail transaction={selectedTransaction} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDetails}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;
