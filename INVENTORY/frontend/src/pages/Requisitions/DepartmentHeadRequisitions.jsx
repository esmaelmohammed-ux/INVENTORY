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
import { useRequisitions, useDeleteRequisition } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DepartmentHeadRequisitions = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, requisition: null });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: requisitions,
    isLoading,
    error,
    refetch,
  } = useRequisitions({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteRequisitionMutation = useDeleteRequisition();

  // Filter to show only current user's requisitions
  const myRequisitions = useMemo(() => {
    if (!requisitions || !user) return [];
    return requisitions.filter(req => {
      const createdBy = req.createdBy;
      return createdBy?.id === user.id || createdBy?._id === user._id || 
             createdBy?.email === user.email;
    });
  }, [requisitions, user]);

  const handleDeleteRequisition = (requisition) => {
    setDeleteDialog({ open: true, requisition });
  };

  const confirmDelete = async () => {
    try {
      await deleteRequisitionMutation.mutateAsync(deleteDialog.requisition.id);
      setNotification({
        open: true,
        message: "Requisition deleted successfully",
        severity: "success"
      });
      setDeleteDialog({ open: false, requisition: null });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to delete requisition",
        severity: "error"
      });
      setDeleteDialog({ open: false, requisition: null });
    }
  };

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
      field: "items",
      headerName: "Items",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.length || 0} items
        </Typography>
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
            onClick={() => navigate(`/requisitions/${params.row.id}`)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRequisition(params.row);
            }}
            title="Delete Requisition"
            disabled={params.row.status !== 'PENDING'} // Only allow deletion of pending requests
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading your requisitions..." />;
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
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Requisitions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage your department's requisition requests
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
            onClick={() => navigate("/requisitions/new")}
          >
            New Requisition
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
          rows={myRequisitions || []}
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
        onClose={() => setDeleteDialog({ open: false, requisition: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.requisition?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, requisition: null })}
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

export default DepartmentHeadRequisitions;