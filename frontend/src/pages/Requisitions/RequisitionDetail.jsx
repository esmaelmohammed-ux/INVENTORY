import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRequisitionDetail, useUpdateRequisitionStatus } from "../../services/queries";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

const RequisitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: requisition, isLoading, error } = useRequisitionDetail(id);
  const updateStatus = useUpdateRequisitionStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "warning" });
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleDelete = () => setConfirmOpen(true);
  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    setSnack({ open: true, message: "Deletion is not supported by the backend.", severity: "warning" });
  };
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync({ id, status: "APPROVED" });
      setSnack({ open: true, message: "Requisition approved", severity: "success" });
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-requisitions" : "/requisitions");
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.error || e.message, severity: "error" });
    }
  };
  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({ id, status: "REJECTED", reasonForRejection: rejectReason });
      setRejectOpen(false);
      setRejectReason("");
      setSnack({ open: true, message: "Requisition rejected", severity: "success" });
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-requisitions" : "/requisitions");
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.error || e.message, severity: "error" });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "error",
      FULFILLED: "info",
    };
    return colors[status] || "default";
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography variant="body1">Loading requisition...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography variant="body1" color="error">
          Error loading requisition: {error.message}
        </Typography>
      </Box>
    );
  }
  if (!requisition) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-requisitions" : "/requisitions")}
          variant="outlined"
        >
          Back to List
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Requisition Details
        </Typography>
        <Chip
          label={requisition.status}
          color={getStatusColor(requisition.status)}
          sx={{ ml: "auto" }}
        />
        {(user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN") && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ ml: 2 }}
          >
            Delete
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {requisition.title}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {requisition.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Items Requested
            </Typography>
            <List>
              {requisition.items?.map((ri, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={ri.item?.name}
                    secondary={`Quantity: ${ri.quantity} ${ri.item?.unit || ""}`}
                  />
                </ListItem>
              ))}
              {(!requisition.items || requisition.items.length === 0) && (
                <ListItem>
                  <ListItemText primary="No items" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {user?.role === "PROCUREMENT_OFFICER" && requisition.status === "PENDING" && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Review Decision
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="success" onClick={handleApprove}>Approve</Button>
                <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)}>Reject</Button>
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Requisition Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1">
                {requisition.department?.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Requested By
              </Typography>
              <Typography variant="body1">
                {requisition.createdBy?.firstName} {requisition.createdBy?.lastName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Date Created
              </Typography>
              <Typography variant="body1">
                {new Date(requisition.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Requisition ID
              </Typography>
              <Typography variant="body1">#{requisition.id}</Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PrintIcon />}
              sx={{ mt: 2 }}
            >
              Print Requisition
            </Button>
          </Paper>
        </Grid>
      </Grid>
    {/* Delete confirm and snackbar */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Requisition"
        message="Deletion is not supported by the backend at the moment."
        confirmText="OK"
        cancelText="Close"
        severity="warning"
      />
      {/* Reject dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Requisition</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Reason for rejection"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={!rejectReason.trim()}>Reject</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequisitionDetail;
