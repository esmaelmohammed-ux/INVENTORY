import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../services/queries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DepartmentManagement = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Queries and mutations
  const { data: departments, isLoading, error } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const handleCreateDepartment = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    try {
      if (isEditMode) {
        await updateDepartment.mutateAsync({
          id: selectedDepartment.id,
          ...formData,
        });
        setSnackbar({
          open: true,
          message: "Department updated successfully",
          severity: "success",
        });
        setEditDialogOpen(false);
      } else {
        await createDepartment.mutateAsync(formData);
        setSnackbar({
          open: true,
          message: "Department created successfully",
          severity: "success",
        });
        setCreateDialogOpen(false);
      }
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} department`,
        severity: "error",
      });
    }
  };

  const handleDeleteDepartment = async () => {
    try {
      await deleteDepartment.mutateAsync(selectedDepartment.id);
      setSnackbar({
        open: true,
        message: "Department deleted successfully",
        severity: "success",
      });
      setDeleteConfirmOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to delete department",
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setSelectedDepartment(null);
    setIsEditMode(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (department) => {
    setSelectedDepartment(department);
    setFormData({ name: department.name, description: department.description });
    setIsEditMode(true);
    setEditDialogOpen(true);
  };

  const openViewDialog = (department) => {
    setSelectedDepartment(department);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (department) => {
    setSelectedDepartment(department);
    setDeleteConfirmOpen(true);
  };

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{
            background: "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)",
            color: "white",
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: "0 3px 8px rgba(76, 175, 80, 0.3)",
            "&:hover": {
              background: "linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Add New Department
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Total: {departments?.length || 0} departments
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Department Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: "0.875rem",
            }}
          >
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Tooltip title={params.value} placement="top-start">
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "users",
      headerName: "Users",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          icon={<PeopleIcon fontSize="small" />}
          label={params.value?.length || 0}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title="View Details">
              <ViewIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => openViewDialog(params.row)}
          sx={{
            color: "info.main",
            "&:hover": {
              bgcolor: "info.light",
            },
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit Department">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => openEditDialog(params.row)}
          sx={{
            color: "primary.main",
            "&:hover": {
              bgcolor: "primary.light",
            },
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete Department">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => openDeleteDialog(params.row)}
          disabled={params.row.users?.length > 0}
          sx={{
            color: params.row.users?.length > 0 ? "grey.400" : "error.main",
            "&:hover": {
              bgcolor: params.row.users?.length > 0 ? "transparent" : "error.light",
            },
          }}
        />,
      ],
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading departments: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Department Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage organizational departments and their associated users
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            size="large"
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976d2 30%, #1e88e5 90%)",
                boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.3s ease",
              minWidth: "200px",
              height: "48px",
            }}
          >
            Create New Department
          </Button>
        </Box>
      </Box>

      {/* Data Grid */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "grey.50",
            fontWeight: 600,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <DataGrid
          rows={departments || []}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          components={{
            Toolbar: CustomToolbar,
          }}
          sx={{
            minHeight: 400,
            "& .MuiDataGrid-cell": {
              border: "none",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
          }}
        />
      </Paper>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Department Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedDepartment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {selectedDepartment.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedDepartment.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(selectedDepartment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Associated Users ({selectedDepartment.users?.length || 0})
                </Typography>
                {selectedDepartment.users?.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {selectedDepartment.users.map((user) => (
                      <Paper 
                        key={user.id} 
                        sx={{ p: 2, bgcolor: "grey.50" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <Chip 
                            label={user.role?.replace('_', ' ')} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No users assigned to this department yet.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Add New Department
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            label="Department Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}
            disabled={createDepartment.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateDepartment}
            variant="contained"
            disabled={createDepartment.isLoading}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
          >
            {createDepartment.isLoading ? "Creating..." : "Create Department"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Edit Department
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            label="Department Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              resetForm();
            }}
            disabled={updateDepartment.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateDepartment}
            variant="contained"
            disabled={updateDepartment.isLoading}
            sx={{
              background: "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
            }}
          >
            {updateDepartment.isLoading ? "Updating..." : "Update Department"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ color: "error.main", fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the department "
            <strong>{selectedDepartment?.name}</strong>"?
          </Typography>
          {selectedDepartment?.users?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This department has {selectedDepartment.users.length} associated user(s).
              Please reassign or remove users before deleting.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteDepartment}
            color="error"
            variant="contained"
            disabled={
              deleteDepartment.isLoading || selectedDepartment?.users?.length > 0
            }
          >
            {deleteDepartment.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentManagement;