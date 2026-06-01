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
import { useRequisitions } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const RequisitionList = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const navigate = useNavigate();

  const {
    data: requisitions,
    isLoading,
    error,
  } = useRequisitions({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const columns = [
    {
      field: "title",
      headerName: "Requisition",
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
      field: "department",
      headerName: "Department",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value?.name} size="small" variant="outlined" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const statusColors = {
          PENDING: "warning",
          APPROVED: "success",
          REJECTED: "error",
          FULFILLED: "info",
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value]}
            size="small"
          />
        );
      },
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
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/requisitions/${params.row.id}`)}
          >
            <ViewIcon />
          </IconButton>
          {/* Edit removed per requirement */}
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading requisitions..." />;
  if (error) return <div>Error loading requisitions: {error.message}</div>;

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
          Requisitions
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            Filter
          </Button>
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
              <MenuItem value="FULFILLED">Fulfilled</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={requisitions || []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={isLoading}
        />
      </Paper>
    </Box>
  );
};

export default RequisitionList;
