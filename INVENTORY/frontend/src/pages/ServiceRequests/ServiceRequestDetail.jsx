import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ArrowBack as BackIcon, Print as PrintIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useServiceRequestDetail, useUpdateServiceRequestStatus } from "../../services/queries";
import { useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";

const statusColor = (status) => {
  const map = { PENDING: "warning", APPROVED: "success", REJECTED: "error" };
  return map[status] || "default";
};

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: request, isLoading, error } = useServiceRequestDetail(id);
  const updateStatus = useUpdateServiceRequestStatus();

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
      setSnack({ open: true, message: "Service request approved", severity: "success" });
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-service-requests" : "/service-requests");
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.error || e.message, severity: "error" });
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({ id, status: "REJECTED", reasonForRejection: rejectReason });
      setRejectOpen(false);
      setRejectReason("");
      setSnack({ open: true, message: "Service request rejected", severity: "success" });
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-service-requests" : "/service-requests");
    } catch (e) {
      setSnack({ open: true, message: e?.response?.data?.error || e.message, severity: "error" });
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  if (!request) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-service-requests" : "/service-requests")} variant="outlined">
          Back to List
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Service Request Details
        </Typography>
        <Chip label={request.status} color={statusColor(request.status)} sx={{ ml: "auto" }} />
        {(user?.role === "PROCUREMENT_OFFICER" || user?.role === "ADMIN") && (
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} sx={{ ml: 1 }}>
            Delete
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left: Request content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {request.title}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {request.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No items associated
            </Typography>
          </Paper>
        </Grid>

        {/* Right: Review and info */}
        <Grid item xs={12} md={4}>
          {user?.role === "PROCUREMENT_OFFICER" && request.status === "PENDING" && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Review Decision
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" color="success" onClick={handleApprove}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Requested By
              </Typography>
              <Typography variant="body1">
                {request.createdBy?.firstName} {request.createdBy?.lastName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Date Created
              </Typography>
              <Typography variant="body1">
                {new Date(request.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Request ID
              </Typography>
              <Typography variant="body1">#{request.id}</Typography>
            </Box>
            <Button fullWidth variant="outlined" startIcon={<PrintIcon />} sx={{ mt: 2 }}>
              Print Request
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service Request"
        message="Deletion is not supported by the backend at the moment."
        confirmText="OK"
        cancelText="Close"
        severity="warning"
      />

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Service Request</DialogTitle>
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
          <Button onClick={handleReject} variant="contained" color="error" disabled={!rejectReason.trim()}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceRequestDetail;
