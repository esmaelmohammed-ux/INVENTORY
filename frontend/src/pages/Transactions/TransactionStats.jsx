import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTransactionStats } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const TransactionStats = () => {
  const [timeframe, setTimeframe] = useState("30days");
  const [chartType, setChartType] = useState("bar");

  const {
    data: stats,
    isLoading,
    error,
  } = useTransactionStats({
    timeframe,
  });

  const getTypeColor = (type) => {
    const colors = {
      RECEIVE: "#4caf50",
      ISSUE: "#f44336",
      ADJUST: "#ff9800",
    };
    return colors[type] || "#9e9e9e";
  };

  const formatChartData = () => {
    if (!stats?.byDate) return [];

    return Object.entries(stats.byDate).map(([date, data]) => ({
      date,
      RECEIVE: data.RECEIVE?.totalQuantity || 0,
      ISSUE: data.ISSUE?.totalQuantity || 0,
      ADJUST: data.ADJUST?.totalQuantity || 0,
    }));
  };

  const formatPieData = () => {
    if (!stats?.byType) return [];

    return stats.byType.map((typeStat) => ({
      name: typeStat.type,
      value: typeStat.totalQuantity,
      count: typeStat.count,
      color: getTypeColor(typeStat.type),
    }));
  };

  if (isLoading)
    return <LoadingSpinner message="Loading transaction statistics..." />;
  if (error) return <div>Error loading statistics: {error.message}</div>;

  const chartData = formatChartData();
  const pieData = formatPieData();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Transaction Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze inventory movements and trends
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeframe}
                label="Time Range"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats?.summary?.totalTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingIcon sx={{ color: "#4caf50" }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Received
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
                {stats?.summary?.totalReceived || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingIcon sx={{ color: "#f44336" }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Issued
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: "#f44336" }}>
                {stats?.summary?.totalIssued || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <InventoryIcon sx={{ color: "#ff9800" }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Net Change
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color:
                    (stats?.summary?.netChange || 0) >= 0
                      ? "#4caf50"
                      : "#f44336",
                }}
              >
                {(stats?.summary?.netChange || 0) >= 0 ? "+" : ""}
                {stats?.summary?.netChange || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              {chartType === "bar" ? <BarChartIcon /> : <PieChartIcon />}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {chartType === "bar"
                  ? "Transactions Over Time"
                  : "Transaction Distribution"}
              </Typography>
            </Box>

            <ResponsiveContainer width="100%" height="90%">
              {chartType === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="RECEIVE" fill="#4caf50" name="Received" />
                  <Bar dataKey="ISSUE" fill="#f44336" name="Issued" />
                  <Bar dataKey="ADJUST" fill="#ff9800" name="Adjusted" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, count }) =>
                      `${name}: ${value} (${count})`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} units`, name]}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Transaction Type Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <ReceiptIcon />
              <Typography variant="h6" sx={{ ml: 1 }}>
                Transaction Breakdown
              </Typography>
            </Box>

            {stats?.byType?.map((typeStat, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: getTypeColor(typeStat.type),
                        mr: 1,
                      }}
                    />
                    {typeStat.type}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {typeStat.count} transactions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Quantity:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{
                      color:
                        typeStat.type === "ISSUE"
                          ? "#f44336"
                          : typeStat.type === "RECEIVE"
                          ? "#4caf50"
                          : "#ff9800",
                    }}
                  >
                    {typeStat.type === "ISSUE" ? "-" : "+"}
                    {typeStat.totalQuantity}
                  </Typography>
                </Box>
                {index < stats.byType.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Top Items Section */}
      {stats?.topItems && stats.topItems.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <InventoryIcon sx={{ mr: 1 }} />
            Top Items by Transaction Volume
          </Typography>

          <Grid container spacing={2}>
            {stats.topItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.category}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Transactions: {item.transactionCount}
                    </Typography>
                    <Typography variant="body2">
                      Net: {item.netChange >= 0 ? "+" : ""}
                      {item.netChange} {item.unit}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default TransactionStats;
