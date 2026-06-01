import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useDownloadReport } from "../../services/queries";

const ReportBuilder = () => {
  const [reportType, setReportType] = useState("inventory");
  const [dateRange, setDateRange] = useState("30days");
  const [format, setFormat] = useState("json");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Report generation hooks
  const downloadReport = useDownloadReport();

  const reportTypes = [
    { value: "inventory", label: "Inventory Report" },
    { value: "transactions", label: "Transaction Report" },
    { value: "requisitions", label: "Requisition Report" },
    { value: "audit", label: "Audit Trail Report" },
    { value: "financial", label: "Financial Summary" },
  ];

  // Helper function to get date range parameters
  const getDateRangeParams = () => {
    const now = new Date();
    let startDateParam, endDateParam;

    if (dateRange === "custom") {
      startDateParam = startDate;
      endDateParam = endDate;
    } else {
      switch (dateRange) {
        case "7days":
          startDateParam = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "30days":
          startDateParam = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "90days":
          startDateParam = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "year":
          startDateParam = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
        default:
          break;
      }
      endDateParam = now.toISOString();
    }

    return { startDate: startDateParam, endDate: endDateParam };
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const dateParams = getDateRangeParams();
      const params = {
        format: format === "pdf" ? "json" : format, // Backend doesn't support PDF yet
        ...dateParams,
      };

      if (format === "csv") {
        // Download CSV directly
        await downloadReport.mutateAsync({ type: reportType, params });
      } else {
        // Generate JSON report to display
        let reportResponse;
        
        // Use the appropriate API endpoint based on report type
        const apiUrl = `/reports/${reportType}`;
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${apiUrl}?${new URLSearchParams(params)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate ${reportType} report`);
        }
        
        reportResponse = await response.json();
        setReportData(reportResponse);
      }
    } catch (err) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Report Builder
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                label="Format"
                onChange={(e) => setFormat(e.target.value)}
              >
                <MenuItem value="json">View Online</MenuItem>
                <MenuItem value="csv">Download CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {dateRange === "custom" && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Custom Date Range
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setReportType("inventory");
              setDateRange("30days");
              setFormat("json");
              setStartDate("");
              setEndDate("");
              setReportData(null);
              setError(null);
            }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Results
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Generated at: {reportData.generatedAt}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {reportType === 'inventory' && `Total Items: ${reportData.totalItems}, Low Stock: ${reportData.lowStockItems}`}
            {reportType === 'transactions' && `Total Transactions: ${reportData.totalTransactions}`}
            {reportType === 'requisitions' && `Total Requisitions: ${reportData.totalRequisitions}`}
            {reportType === 'audit' && `Total Records: ${reportData.totalRecords}`}
            {reportType === 'financial' && `Inventory Value: $${reportData.summary?.totalInventoryValue || 0}, Requisition Value: $${reportData.summary?.totalRequisitionValue || 0}`}
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
            <pre style={{ fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Information
        </Typography>
        <Typography color="text.secondary">
          • Select report type and date range above
          • Choose "View Online" to display results here
          • Choose "Download CSV" to save the report
          • Use custom date range for specific periods
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportBuilder;
