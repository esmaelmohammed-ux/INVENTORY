import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRequisitions, useFulfillRequisition } from "../../services/queries";
import { 
  Search as SearchIcon, 
  CheckCircle as FulfillIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Business as DepartmentIcon,
} from "@mui/icons-material";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const FulfillRequisitions = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [detailDialog, setDetailDialog] = useState({ open: false, requisition: null });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [fulfilling, setFulfilling] = useState(null);

  const { data: requisitions, isLoading, error, refetch } = useRequisitions({
    status: "APPROVED",
    search: search || undefined,
  });
  const fulfill = useFulfillRequisition();

  const rows = useMemo(() => requisitions || [], [requisitions]);

  const handleViewDetails = (requisition) => {
    setDetailDialog({ open: true, requisition });
  };

  const handleFulfill = async (requisition) => {
    setFulfilling(requisition.id);
    try {
      await fulfill.mutateAsync(requisition.id);
      setNotification({
        open: true,
        message: `Requisition "${requisition.title}" has been fulfilled successfully!`,
        severity: "success"
      });
      refetch();
    } catch (e) {
      setNotification({
        open: true,
        message: e.response?.data?.error || "Failed to fulfill requisition",
        severity: "error"
      });
    } finally {
      setFulfilling(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
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
      renderCell: (params) => <Chip label={params.value?.name || "-"} size="small" variant="outlined" />,
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
      width: 130,
      valueGetter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
    },
    {
      field: "items",
      headerName: "Items",
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={`${params.value?.length || 0} items`} 
          size="small" 
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          <Button
            variant="contained"
            size="small"
            startIcon={<FulfillIcon />}
            onClick={() => handleFulfill(params.row)}
            disabled={fulfilling === params.row.id}
            sx={{ minWidth: 100 }}
          >
            {fulfilling === params.row.id ? "Fulfilling..." : "Fulfill"}
          </Button>
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading approved requisitions..." />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Fulfill Requisitions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process approved requisition requests from departments
          </Typography>
        </Box>
        <Chip 
          label={`${rows.length} pending`} 
          color="info" 
          size="large"
          sx={{ fontSize: '1rem', px: 2, py: 1 }}
        />
      </Box>

      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🔍 Search & Filter
        </Typography>
        <TextField
          placeholder="Search by title, department, or requester..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
          size="small"
          sx={{ width: { xs: '100%', sm: 400 } }}
        />
      </Paper>

      <Paper 
        elevation={2}
        sx={{ 
          height: 600, 
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id || row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={isLoading || fulfill.isLoading}
          disableSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, requisition: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            Requisition Details
          </Box>
          <IconButton
            size="small"
            onClick={() => setDetailDialog({ open: false, requisition: null })}
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {detailDialog.requisition && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              {/* Header Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {detailDialog.requisition.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {detailDialog.requisition.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DepartmentIcon color="info" fontSize="small" />
                          <Typography variant="caption" fontWeight={600} color="info.main">
                            DEPARTMENT
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {detailDialog.requisition.department?.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon color="success" fontSize="small" />
                          <Typography variant="caption" fontWeight={600} color="success.main">
                            REQUESTED BY
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {detailDialog.requisition.createdBy?.firstName} {detailDialog.requisition.createdBy?.lastName}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              {/* Items List */}
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color="primary" /> Items to Fulfill ({detailDialog.requisition.items?.length || 0})
              </Typography>
              
              <List sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2, p: 1 }}>
                {detailDialog.requisition.items?.map((item, index) => (
                  <ListItem key={index} divider={index < detailDialog.requisition.items.length - 1}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {item.item?.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Quantity: {item.quantity} {item.item?.unit}
                          </Typography>
                          <Chip label={item.item?.category?.name} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="No items found" />
                  </ListItem>
                )}
              </List>
            </Box>
          </DialogContent>
        )}
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDetailDialog({ open: false, requisition: null })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          {detailDialog.requisition && (
            <Button
              onClick={() => {
                handleFulfill(detailDialog.requisition);
                setDetailDialog({ open: false, requisition: null });
              }}
              variant="contained"
              startIcon={<FulfillIcon />}
              disabled={fulfilling === detailDialog.requisition.id}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {fulfilling === detailDialog.requisition.id ? "Fulfilling..." : "Fulfill Now"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FulfillRequisitions;
