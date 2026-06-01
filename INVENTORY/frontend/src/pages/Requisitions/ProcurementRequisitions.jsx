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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useRequisitions, useUpdateRequisitionStatus } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ProcurementRequisitions = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    requisition: null, 
    action: null 
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  
  const navigate = useNavigate();

  const {
    data: requisitions,
    isLoading,
    error,
    refetch,
  } = useRequisitions({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const updateStatusMutation = useUpdateRequisitionStatus();

  const handleAction = (requisition, action) => {
    setActionDialog({ open: true, requisition, action });
    setRejectionReason("");
  };

  const confirmAction = async () => {
    try {
      const { requisition, action } = actionDialog;
      await updateStatusMutation.mutateAsync({
        id: requisition.id,
        status: action === "approve" ? "APPROVED" : "REJECTED",
        reasonForRejection: action === "reject" ? rejectionReason : undefined,
      });

      setNotification({
        open: true,
        message: `Requisition ${action === "approve" ? "approved" : "rejected"} successfully`,
        severity: "success"
      });

      setActionDialog({ open: false, requisition: null, action: null });
      refetch();
    } catch {
      setNotification({
        open: true,
        message: "Failed to update requisition status",
        severity: "error"
      });
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
      field: "department",
      headerName: "Department",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value?.name} size="small" variant="outlined" />
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
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/requisitions/${params.row.id}`)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          {params.row.status === "PENDING" && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={() => handleAction(params.row, "approve")}
                title="Approve"
              >
                <ApproveIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleAction(params.row, "reject")}
                title="Reject"
              >
                <RejectIcon />
              </IconButton>
            </>
          )}
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
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Procurement - Requisitions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve department requisition requests
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
          disableSelectionOnClick
        />
      </Paper>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, requisition: null, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === "approve" ? "Approve Requisition" : "Reject Requisition"}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionDialog.action} "{actionDialog.requisition?.title}"?
          </Typography>
          {actionDialog.action === "reject" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, requisition: null, action: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmAction} 
            color={actionDialog.action === "approve" ? "success" : "error"}
            variant="contained"
            disabled={actionDialog.action === "reject" && !rejectionReason.trim()}
          >
            {actionDialog.action === "approve" ? "Approve" : "Reject"}
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

export default ProcurementRequisitions;