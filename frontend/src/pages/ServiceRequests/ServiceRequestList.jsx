import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useServiceRequests } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ServiceRequestList = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const navigate = useNavigate();

  const { data: requests, isLoading, error } = useServiceRequests({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const statusColor = (status) => {
    const map = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "error",
      IN_PROGRESS: "info",
      COMPLETED: "success",
    };
    return map[status] || "default";
  };

  const columns = [
    {
      field: "title",
      headerName: "Service Request",
      flex: 2,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.description}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={statusColor(params.value)} />
      ),
    },
    {
      field: "createdBy",
      headerName: "Requested By",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.firstName} {params.value?.lastName}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton size="small" onClick={() => navigate(`/service-requests/${params.row.id}`)}>
          <ViewIcon />
        </IconButton>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading service requests..." />;
  if (error) return <div>Error loading service requests: {error.message}</div>;

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
          Service Requests
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            Filter
          </Button>
          {/* Create new request removed per requirement */}
        </Box>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid rows={requests || []} columns={columns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} />
      </Paper>
    </Box>
  );
};

export default ServiceRequestList;
