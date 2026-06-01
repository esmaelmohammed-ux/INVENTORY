import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "info",
  loading = false,
  maxWidth = "sm",
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={getSeverityColor()}
          sx={{ minWidth: 80 }}
        >
          {loading ? "Deleting..." : confirmText}{" "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
