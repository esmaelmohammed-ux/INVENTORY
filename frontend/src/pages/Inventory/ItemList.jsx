import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Tune as AdjustIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useItems, useDeleteItem, useCreateTransaction, useAdjustStock } from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const ItemList = () => {
  const navigate = useNavigate();
  const [searchTerm] = useState("");
  const [categoryFilter] = useState("all");
  const [statusFilter] = useState("all");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txMode, setTxMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [txQty, setTxQty] = useState(0);
  const [txNotes, setTxNotes] = useState("");

  const { user } = useAuth();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  const {
    data: items,
    isLoading,
    error,
  } = useItems({
    search: searchTerm || undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const deleteItemMutation = useDeleteItem();
  const createTransaction = useCreateTransaction();
  const adjustStock = useAdjustStock();

  const handleDeleteItem = (item) => {
    openDialog({
      title: "Delete Item",
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      severity: "error",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteItemMutation.mutateAsync(item.id);
          setNotification({
            open: true,
            message: `"${item.name}" has been deleted successfully.`,
            severity: "success",
          });
        } catch (error) {
          setNotification({
            open: true,
            message: `Failed to delete "${item.name}": ${
              error.response?.data?.error || error.message
            }`,
            severity: "error",
          });
        }
      },
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const openTxDialog = (mode, item) => {
    setTxMode(mode);
    setSelectedItem(item);
    setTxQty(0);
    setTxNotes("");
    setTxDialogOpen(true);
  };

  const closeTxDialog = () => {
    setTxDialogOpen(false);
    setSelectedItem(null);
    setTxMode(null);
    setTxQty(0);
    setTxNotes("");
  };

  const submitTransaction = async () => {
    if (!selectedItem || !txMode) return;
    try {
      if (txMode === "ADJUST") {
        await adjustStock.mutateAsync({
          itemId: selectedItem.id || selectedItem._id,
          quantity: Number(txQty),
          notes: txNotes || undefined,
        });
      } else {
        await createTransaction.mutateAsync({
          itemId: selectedItem.id || selectedItem._id,
          type: txMode,
          quantity: Math.abs(Number(txQty)),
          notes: txNotes || undefined,
        });
      }
      setNotification({ open: true, message: `${txMode} successful`, severity: "success" });
      closeTxDialog();
    } catch (e) {
      setNotification({ open: true, message: e?.response?.data?.error || e.message, severity: "error" });
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Item Name",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InventoryIcon color="primary" fontSize="small" />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        const label =
          typeof value === "string"
            ? value
            : value?.name || params.row.categoryName || String(params.row.categoryId || "Uncategorized");
        return (
          <Chip
            label={label}
            size="small"
            variant="outlined"
            color="primary"
          />
        );
      },
    },
    {
      field: "quantity",
      headerName: "Stock",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value} {params.row.unit}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Min: {params.row.minQuantity}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status =
          params.row.quantity <= params.row.minQuantity ? "LOW" : "OK";
        return (
          <Chip
            label={status}
            size="small"
            color={status === "LOW" ? "error" : "success"}
            variant={status === "LOW" ? "filled" : "outlined"}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/inventory/${params.row.id}`)}
          >
            <ViewIcon />
          </IconButton>
          {(user?.role === "ADMIN" || user?.role === "STOREKEEPER") && (
            <>
                            <IconButton
                size="small"
                color="default"
                onClick={() => openTxDialog("ADJUST", params.row)}
                disabled={deleteItemMutation.isLoading}
                title="Adjust stock"
              >
                <AdjustIcon />
              </IconButton>
              <IconButton
                size="small"
                color="secondary"
                onClick={() => navigate(`/inventory/edit/${params.row.id}`)}
                disabled={deleteItemMutation.isLoading}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteItem(params.row)}
                disabled={deleteItemMutation.isLoading}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading inventory..." />;
  if (error) return <div>Error loading inventory: {error.message}</div>;

  return (
    <Box>
      <ConfirmDialog
        open={isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        severity={config.severity}
        loading={deleteItemMutation.isLoading}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Inventory Management
        </Typography>
        {(user?.role === "ADMIN" || user?.role === "STOREKEEPER") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/inventory/new`)}
            disabled={deleteItemMutation.isLoading}
          >
            Add New Item
          </Button>
        )}
      </Box>

      {/* Statistics Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, minWidth: 200, textAlign: "center" }}>
          <Typography variant="h4" color="primary">
            {items?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Items
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200, textAlign: "center" }}>
          <Typography variant="h4" color="error">
            {items?.filter((item) => item.quantity <= item.minQuantity)
              .length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Low Stock
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200, textAlign: "center" }}>
          <Typography variant="h4" color="success.main">
            {items?.filter((item) => item.quantity > item.minQuantity).length ||
              0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In Stock
          </Typography>
        </Paper>
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={(items || []).filter((it) =>
            statusFilter === "all"
              ? true
              : statusFilter === "low"
              ? (it.quantity ?? 0) <= (it.minQuantity ?? 0)
              : (it.quantity ?? 0) > (it.minQuantity ?? 0)
          )}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection={false}
          disableSelectionOnClick
          getRowId={(row) => row.id || row._id}
          loading={isLoading || deleteItemMutation.isLoading || createTransaction.isLoading || adjustStock.isLoading}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "background.default",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid",
              borderColor: "divider",
            },
          }}
        />
      </Paper>

      {/* Transaction Dialog */}
      <Dialog open={txDialogOpen} onClose={closeTxDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {txMode === "RECEIVE" && "Receive Stock"}
          {txMode === "ISSUE" && "Issue Items"}
          {txMode === "ADJUST" && "Adjust Stock"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedItem ? `${selectedItem.name} • Current: ${selectedItem.quantity} ${selectedItem.unit || ""}` : ""}
            </Typography>
            <TextField
              label="Quantity"
              type="number"
              value={txQty}
              onChange={(e) => setTxQty(e.target.value)}
              inputProps={{ step: 1 }}
              fullWidth
            />
            <TextField
              label="Notes (optional)"
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            {txMode === "ISSUE" && (
              <Alert severity="info">Issuing more than available stock will be validated by the system.</Alert>
            )}
            {txMode === "ADJUST" && (
              <Alert severity="warning">Use positive values to increase and negative values to decrease stock.</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTxDialog} variant="outlined">Cancel</Button>
          <Button onClick={submitTransaction} variant="contained" disabled={createTransaction.isLoading || adjustStock.isLoading}>
            {createTransaction.isLoading || adjustStock.isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Low Stock Warning */}
      {items?.filter((item) => item.quantity <= item.minQuantity).length >
        0 && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: "error.light",
            color: "error.contrastText",
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            ⚠️ Warning:{" "}
            {items.filter((item) => item.quantity <= item.minQuantity).length}
            item(s) are low on stock and need restocking.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ItemList;
