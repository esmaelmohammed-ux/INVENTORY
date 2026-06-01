import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

import { useUsers, useDeleteUser } from "../../services/queries.js";
import UserFormDialog from "./UserFormDialog.jsx";
import UserDetailsDialog from "./UserDetailsDialog.jsx";

const initials = (nameOrEmail = "") => {
  const pieces = nameOrEmail.split(" ").filter(Boolean);
  if (pieces.length === 0) return "?";
  if (pieces.length === 1) return pieces[0].slice(0, 2).toUpperCase();
  return (pieces[0][0] + pieces[1][0]).toUpperCase();
};

export default function UserManagement() {
  const { data: users = [], isLoading, isError, error } = useUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Filter states
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);

  const roles = useMemo(() => {
    const uniqueRoles = [
      ...new Set(users.map((user) => user.role).filter(Boolean)),
    ];
    return uniqueRoles.sort();
  }, [users]);

  const departments = useMemo(() => {
    const uniqueDepts = [
      ...new Set(users.map((user) => user.department?.name).filter(Boolean)),
    ];
    return uniqueDepts.sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();

    return users.filter((u) => {
      // Search filter
      const matchesSearch =
        !q ||
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.lastName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q) ||
        (u.department?.name || "").toLowerCase().includes(q);

      // Role filter
      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" || u.department?.name === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [users, search, roleFilter, departmentFilter]);

  const paginated = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setDepartmentFilter("all");
    setPage(0);
  };

  // Check if any filter is active
  const isFilterActive =
    search || roleFilter !== "all" || departmentFilter !== "all";

  // handlers
  const handleOpenCreate = () => setOpenCreate(true);

  const handleEdit = (id) => {
    setSelectedUserId(id);
    setOpenEdit(true);
  };
  const handleView = (id) => {
    setSelectedUserId(id);
    setOpenView(true);
  };

  const handleDeleteConfirm = (id) => {
    setSelectedUserId(id);
    setOpenConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(selectedUserId);
      setSnack({ open: true, message: "User deleted", severity: "success" });
    } catch (err) {
      setSnack({
        open: true,
        message: err?.message || "Delete failed",
        severity: "error",
      });
    } finally {
      setOpenConfirm(false);
      setSelectedUserId(null);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          boxShadow: "0 8px 30px rgba(11,22,39,0.06)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr auto",
            },
            gap: 2,
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left Section */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system users{" "}
              {filtered.length !== users.length &&
                `(${filtered.length} of ${users.length} filtered)`}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // Stack vertically on small screens
                sm: "auto auto auto", // Side by side on larger screens
              },
              gap: 1,
              justifyItems: "end",
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
                endAdornment: search && (
                  <IconButton
                    size="small"
                    onClick={() => setSearch("")}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 200 } }}
            />

            <Tooltip title="Filter options">
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                color={isFilterActive ? "primary" : "default"}
                sx={{
                  border: isFilterActive
                    ? "1px solid"
                    : "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 1,
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Create user
            </Button>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={filterOpen}
          onClose={() => setFilterAnchorEl(null)}
          PaperProps={{
            sx: {
              p: 2,
              mt: 1,
              minWidth: 250,
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Filters
          </Typography>

          {/* Role Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              size="small"
              onClick={resetFilters}
              disabled={!isFilterActive}
              startIcon={<ClearIcon />}
            >
              Clear All
            </Button>
            <Button
              size="small"
              onClick={() => setFilterAnchorEl(null)}
              variant="contained"
            >
              Apply
            </Button>
          </Box>
        </Menu>
      </Paper>

      {/* Active Filters Indicator */}
      {isFilterActive && (
        <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              Active filters:
            </Typography>

            {search && (
              <Chip
                label={`Search: "${search}"`}
                size="small"
                onDelete={() => setSearch("")}
              />
            )}

            {roleFilter !== "all" && (
              <Chip
                label={`Role: ${roleFilter}`}
                size="small"
                onDelete={() => setRoleFilter("all")}
              />
            )}

            {departmentFilter !== "all" && (
              <Chip
                label={`Department: ${departmentFilter}`}
                size="small"
                onDelete={() => setDepartmentFilter("all")}
              />
            )}

            <Button size="small" onClick={resetFilters} sx={{ ml: "auto" }}>
              Clear All
            </Button>
          </Box>
        </Paper>
      )}

      {/* Table */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
          minHeight: 400,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">
              Error loading users: {error?.message}
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {isFilterActive
                ? "No users match your filters"
                : "No users found"}
            </Typography>
            {isFilterActive && (
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<ClearIcon />}
              >
                Clear filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell sx={{ alignContent: "end" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((user) => (
                    <TableRow key={user._id || user.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {initials(user.firstName || user.email)}
                          </Avatar>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {user.firstName || "—"}
                            </Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                              {user.lastName || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || "user"}
                          size="small"
                          color={user.role === "admin" ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell>{user.department?.name || "—"}</TableCell>

                      <TableCell align="right">
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(user._id || user.id)}
                          >
                            <VisibilityIcon sx={{ color: "info.main" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit user">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user._id || user.id)}
                          >
                            <EditIcon sx={{ color: "primary.main" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteConfirm(user._id || user.id)
                            }
                          >
                            <DeleteIcon sx={{ color: "error.main" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 8, 10, 25]}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          </>
        )}
      </Paper>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add user"
        onClick={handleOpenCreate}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialogs & Feedback */}
      <UserFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={(msg) =>
          setSnack({ open: true, message: msg, severity: "success" })
        }
        mode="create"
      />

      <UserFormDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={(msg) =>
          setSnack({ open: true, message: msg, severity: "success" })
        }
        mode="edit"
      />

      <UserDetailsDialog
        open={openView}
        onClose={() => setOpenView(false)}
        userId={selectedUserId}
      />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
