import { useState, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useServiceRequests, useDeleteServiceRequest } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DepartmentHeadServiceRequests = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, request: null });
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: serviceRequests,
    isLoading,
    error,
    refetch,
  } = useServiceRequests({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteServiceRequestMutation = useDeleteServiceRequest();

  // Filter to show only current user's service requests
  const myServiceRequests = useMemo(() => {
    if (!serviceRequests || !user) return [];
    return serviceRequests.filter(req => {
      const createdBy = req.createdBy;
      return createdBy?.id === user.id || createdBy?._id === user._id || 
             createdBy?.email === user.email;
    });
  }, [serviceRequests, user]);

  const handleDeleteRequest = (request) => {
    setDeleteDialog({ open: true, request });
  };

  const confirmDelete = async () => {
    try {
      await deleteServiceRequestMutation.mutateAsync(deleteDialog.request.id);
      setNotification({
        open: true,
        message: "Service request deleted successfully",
        severity: "success"
      });
      setDeleteDialog({ open: false, request: null });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to delete service request",
        severity: "error"
      });
      setDeleteDialog({ open: false, request: null });
    }
  };

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
        <Chip 
          label={params.value} 
          size="small" 
          color={statusColor(params.value)} 
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      renderCell: (params) => {
        const priorityColors = {
          LOW: "default",
          MEDIUM: "warning",
          HIGH: "error",
          URGENT: "error",
        };
        return (
          <Chip
            label={params.value || "MEDIUM"}
            size="small"
            color={priorityColors[params.value] || "default"}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date Created",
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/service-requests/${params.row.id}`)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRequest(params.row);
            }}
            title="Delete Request"
            disabled={params.row.status !== 'PENDING'} // Only allow deletion of pending requests
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading your service requests..." />;
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
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Service Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage your department's service requests
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/service-requests/new")}
          >
            New Service Request
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
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={myServiceRequests || []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={isLoading}
          disableSelectionOnClick
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, request: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.request?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, request: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentHeadServiceRequests;