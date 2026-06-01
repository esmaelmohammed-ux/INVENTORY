import { Box, Paper, Typography, Button, Chip, Grid } from "@mui/material";
import {
  Download as DownloadIcon,
  ArrowBack as BackIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ReportView = () => {
  const navigate = useNavigate();

  // Mock report data
  const report = {
    id: 1,
    title: "Inventory Summary Report",
    type: "inventory",
    generatedAt: "2024-01-15T10:30:00.000Z",
    format: "pdf",
    parameters: {
      dateRange: "Last 30 days",
      categories: "All",
      status: "All",
    },
    summary: {
      totalItems: 156,
      lowStockItems: 12,
      totalValue: 45890,
    },
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/reports")}
          variant="outlined"
        >
          Back to Reports
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {report.title}
        </Typography>
        <Chip label={report.format.toUpperCase()} variant="outlined" />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              height: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box textAlign="center">
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Report Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PDF preview would be displayed here
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Report Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Report Type
              </Typography>
              <Typography variant="body1" textTransform="capitalize">
                {report.type}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Date Range
              </Typography>
              <Typography variant="body1">
                {report.parameters.dateRange}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Generated On
              </Typography>
              <Typography variant="body1">
                {new Date(report.generatedAt).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Report ID
              </Typography>
              <Typography variant="body1">#{report.id}</Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ mb: 1 }}
            >
              Download Report
            </Button>

            <Button fullWidth variant="outlined" startIcon={<PrintIcon />}>
              Print Report
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Summary
            </Typography>
            <Box>
              <Typography variant="body2">
                Total Items: <strong>{report.summary.totalItems}</strong>
              </Typography>
              <Typography variant="body2">
                Low Stock Items: <strong>{report.summary.lowStockItems}</strong>
              </Typography>
              <Typography variant="body2">
                Total Value: <strong>${report.summary.totalValue}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportView;
