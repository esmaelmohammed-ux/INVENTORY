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
  Alert,
  alpha,
  useTheme,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  RequestQuote as RequisitionIcon,
} from "@mui/icons-material";
import { useDashboardStats, useRequisitions } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const StorekeeperDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: approvedReqs } = useRequisitions({ status: "APPROVED" });

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <div>Error loading dashboard data: {error.message}</div>;

  const lowStockItems = stats?.lowStockItems || stats?.inventory?.lowStockItems || [];
  const totalItems = stats?.inventorySummary?.totalItems ?? stats?.itemsCount ?? stats?.inventory?.total ?? 0;
  const lowStockCount = stats?.inventorySummary?.lowStockCount ?? lowStockItems.length;
  const inStockCount = totalItems - lowStockCount;
  const recentTx = stats?.transactions?.recent || stats?.recentTransactions || stats?.recentActivity || [];

  const getTypeColor = (type) => {
    const map = { RECEIVE: "success", ISSUE: "error", ADJUST: "warning" };
    return map[type] || "default";
  };

  const StatCard = ({ title, value, icon, color = "primary", subtitle, onClick }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        borderRadius: 3,
        '&:hover': onClick ? {
          elevation: 4,
          transform: 'translateY(-2px)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        <Avatar
          sx={{ 
            bgcolor: `${color}.light`, 
            width: 60, 
            height: 60, 
            mx: 'auto', 
            mb: 2 
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h3" sx={{ fontWeight: 700, color: `${color}.main`, mb: 1 }}>
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

  return (
    <Box>
      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.warning.main}`,
            bgcolor: alpha(theme.palette.warning.main, 0.05)
          }}
        >
          <Typography fontWeight={600}>
            <strong>⚠️ Attention:</strong> {lowStockItems.length} item(s) are low on stock and need restocking.
          </Typography>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 4
        }}
      >
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={<InventoryIcon />}
          color="primary"
          subtitle="Items in system"
          onClick={() => navigate("/inventory")}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          icon={<WarningIcon />}
          color="warning"
          subtitle="Need restocking"
        />
        <StatCard
          title="In Stock"
          value={inStockCount}
          icon={<CheckIcon />}
          color="success"
          subtitle="Available items"
        />
        <StatCard
          title="Pending Fulfillment"
          value={approvedReqs?.length || 0}
          icon={<RequisitionIcon />}
          color="info"
          subtitle="Approved requisitions"
          onClick={() => navigate("/requisitions/fulfill")}
        />
      </Box>

      {/* Content Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr'
          },
          gap: 3
        }}
      >
        {/* Left Column: Recent Transactions */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShippingIcon color="primary" /> Recent Transactions
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <List sx={{ p: 0 }}>
              {recentTx.slice(0, 6).map((tx, index) => {
                const name = tx.item?.name || tx.itemName || tx.item || "Unknown item";
                const unit = tx.item?.unit || tx.unit || "";
                const qty = Math.abs(tx.quantity ?? 0);
                const type = tx.type || tx.actionType || "N/A";
                const date = tx.createdAt || tx.date;
                return (
                  <ListItem key={index} divider={index < recentTx.length - 1} sx={{ px: 0 }}>
                    <Box sx={{ mr: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette[getTypeColor(type)].main, 0.1),
                          color: `${getTypeColor(type)}.main`,
                          width: 36,
                          height: 36
                        }}
                      >
                        {type === 'RECEIVE' ? '📥' : type === 'ISSUE' ? '📤' : '⚙️'}
                      </Avatar>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {qty} {unit} • {date ? new Date(date).toLocaleDateString() : ""}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={type} 
                      size="small" 
                      color={getTypeColor(type)}
                      sx={{ minWidth: 70 }}
                    />
                  </ListItem>
                );
              })}
              {recentTx.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent transactions
                  </Typography>
                </Box>
              )}
            </List>
            <Divider sx={{ my: 2 }} />
            <Button 
              variant="contained" 
              startIcon={<InventoryIcon />} 
              onClick={() => navigate("/transactions")}
              sx={{ borderRadius: 2 }}
            >
              View All Transactions
            </Button>
          </Box>
        </Paper>


        {/* Right Column: Quick Actions & Low Stock */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Quick Actions */}
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
              <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon color="success" /> Quick Actions
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button 
                  variant="contained" 
                  startIcon={<ShippingIcon />} 
                  fullWidth 
                  onClick={() => navigate("/transactions")}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Receive Stock
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<InventoryIcon />}
                  fullWidth
                  onClick={() => navigate("/transactions")}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Issue Items
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<RequisitionIcon />}
                  fullWidth 
                  onClick={() => navigate("/requisitions/fulfill")}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Fulfill Requisitions
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/inventory/stats")}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Stock Count
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Paper 
              elevation={2}
              sx={{ 
                borderRadius: 3,
                border: `1px solid ${theme.palette.warning.main}`,
                bgcolor: alpha(theme.palette.warning.main, 0.02),
              }}
            >
              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon /> Low Stock Alert
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <List sx={{ p: 0 }}>
                  {lowStockItems.slice(0, 5).map((it, index) => {
                    const name = it.name || it.itemName || "Unknown item";
                    const current = it.quantity ?? it.currentQuantity ?? 0;
                    const min = it.minQuantity ?? it.minimumQuantity ?? 0;
                    const unit = it.unit || "";
                    return (
                      <ListItem
                        key={index}
                        divider={index < Math.min(lowStockItems.length, 5) - 1}
                        sx={{ px: 0 }}
                      >
                        <Box sx={{ mr: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: 'warning.main',
                              width: 32,
                              height: 32
                            }}
                          >
                            ⚠️
                          </Avatar>
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Current: {current} {unit} | Min: {min} {unit}
                            </Typography>
                          }
                        />
                        <Chip
                          label="LOW"
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      </ListItem>
                    );
                  })}
                </List>
                {lowStockItems.length > 5 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="warning.main">
                      +{lowStockItems.length - 5} more items need attention
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Button 
                  variant="outlined" 
                  color="warning" 
                  fullWidth
                  onClick={() => navigate("/inventory")}
                  sx={{ borderRadius: 2 }}
                >
                  View All Items
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StorekeeperDashboard;
