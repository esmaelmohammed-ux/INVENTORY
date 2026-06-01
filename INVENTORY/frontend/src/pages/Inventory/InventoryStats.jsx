import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  BarChart as ChartIcon,
  Download as DownloadIcon,
  Inventory as StockIcon,
  Warning as WarningIcon,
  CheckCircle as OkIcon,
} from "@mui/icons-material";
import { useItems } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const InventoryStats = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const { data: items, isLoading, error } = useItems();

  if (isLoading)
    return <LoadingSpinner message="Loading inventory statistics..." />;
  if (error) return <div>Error loading statistics: {error.message}</div>;

  const lowStockItems =
    items?.filter((item) => item.quantity <= item.minQuantity) || [];
  const inStockItems =
    items?.filter((item) => item.quantity > item.minQuantity) || [];

  const categoryStats = items?.reduce((acc, item) => {
    const category = item.category?.name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { total: 0, lowStock: 0 };
    }
    acc[category].total++;
    if (item.quantity <= item.minQuantity) {
      acc[category].lowStock++;
    }
    return acc;
  }, {});

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Inventory Statistics
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <StockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{items?.length || 0}</Typography>
              <Typography color="text.secondary">Total Items</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <OkIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{inStockItems.length}</Typography>
              <Typography color="text.secondary">In Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{lowStockItems.length}</Typography>
              <Typography color="text.secondary">Low Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <ChartIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">
                {items?.length
                  ? Math.round((inStockItems.length / items.length) * 100)
                  : 0}
                %
              </Typography>
              <Typography color="text.secondary">Stock Health</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            {Object.entries(categoryStats || {}).map(([category, stats]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{category}</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.total} items
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      backgroundColor: "grey.200",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(stats.total / (items?.length || 1)) * 100}%`,
                        height: "100%",
                        backgroundColor: "primary.main",
                      }}
                    />
                  </Box>
                  <Typography variant="caption">
                    {Math.round((stats.total / (items?.length || 1)) * 100)}%
                  </Typography>
                </Box>
                {stats.lowStock > 0 && (
                  <Typography variant="caption" color="warning.main">
                    {stats.lowStock} low stock
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alert ({lowStockItems.length})
            </Typography>
            {lowStockItems.slice(0, 5).map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  mb: 1,
                  border: 1,
                  borderColor: "warning.light",
                  borderRadius: 1,
                  backgroundColor: "warning.light",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current: {item.quantity} {item.unit} • Minimum:{" "}
                  {item.minQuantity} {item.unit}
                </Typography>
                <Typography variant="caption" color="warning.dark">
                  {item.category?.name}
                </Typography>
              </Box>
            ))}
            {lowStockItems.length > 5 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                +{lowStockItems.length - 5} more items with low stock...
              </Typography>
            )}
            {lowStockItems.length === 0 && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ textAlign: "center", py: 3 }}
              >
                🎉 All items are sufficiently stocked!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Stock Health Overview */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stock Health Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main">
                {inStockItems.length}
              </Typography>
              <Typography variant="body2">Items Well-Stocked</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main">
                {lowStockItems.length}
              </Typography>
              <Typography variant="body2">Items Need Restocking</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary.main">
                {items?.length || 0}
              </Typography>
              <Typography variant="body2">Total Inventory Items</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main">
                {items?.length
                  ? Math.round((inStockItems.length / items.length) * 100)
                  : 0}
                %
              </Typography>
              <Typography variant="body2">Stock Health Rate</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InventoryStats;
