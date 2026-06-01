import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  useCreateUser,
  useUpdateUser,
  useDetailUser,
  useDepartments,
} from "../../services/queries.js";

const UserRole = {
  STOREKEEPER: "STOREKEEPER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER",
  ADMIN: "ADMIN",
  AUDITOR: "AUDITOR",
};

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  departmentId: "",
  password: "",
};

function UserFormDialog({ open, onClose, onSuccess, userId, mode }) {
  const isEdit = mode === "edit";
  const { data: detail, isLoading: loadingDetail } = useDetailUser(userId);
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartments();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const administrationDepartment = useMemo(() => {
    return departments.find(
      (dept) => dept.name.toLowerCase() === "administration"
    );
  }, [departments]);

  const availableDepartments = useMemo(() => {
    if (form.role === UserRole.DEPARTMENT_HEAD && administrationDepartment) {
      return departments.filter(
        (dept) => dept.id !== administrationDepartment.id
      );
    }
    return departments;
  }, [departments, form.role, administrationDepartment]);

  useEffect(() => {
    if (isEdit && detail) {
      setForm({
        firstName: detail.firstName || "",
        lastName: detail.lastName || "",
        email: detail.email || "",
        role: detail.role || "",
        departmentId: detail.department?.id || "",
        active: detail.active ?? true,
        password: "",
      });
    } else {
      setForm(initial);
      setErrors({});
    }
  }, [detail, isEdit, open]);

  useEffect(() => {
    if (form.role && !isEdit) {
      if (form.role === UserRole.DEPARTMENT_HEAD) {
        if (!form.departmentId && availableDepartments.length > 0) {
          setForm((prev) => ({
            ...prev,
            departmentId: availableDepartments[0].id,
          }));
        }
      } else if (administrationDepartment && !form.departmentId) {
        setForm((prev) => ({
          ...prev,
          departmentId: administrationDepartment.id,
        }));
      }
    }
  }, [
    form.role,
    administrationDepartment,
    isEdit,
    form.departmentId,
    availableDepartments,
  ]);

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required";
    if (!form.lastName) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!isEdit && !form.password) e.password = "Password is required";
    else if (!isEdit && form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.role) e.role = "Role is required";
    if (form.role === UserRole.DEPARTMENT_HEAD) {
      if (!form.departmentId)
        e.departmentId = "Department is required for this role";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const submitData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      };

      if (form.role === UserRole.DEPARTMENT_HEAD) {
        submitData.departmentId = form.departmentId;
      } else {
        submitData.departmentId = administrationDepartment?.id || "";
      }

      if (!isEdit && form.password) {
        submitData.password = form.password;
      }

      if (isEdit) {
        await updateUser.mutateAsync({ id: userId, ...submitData });
        onSuccess && onSuccess("User updated");
      } else {
        await createUser.mutateAsync(submitData);
        onSuccess && onSuccess("User created");
      }
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit:
          err?.response?.data?.message || err?.message || "Request failed",
      }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setForm((prev) => {
      let departmentId = prev.departmentId;
      if (newRole === UserRole.DEPARTMENT_HEAD) {
        if (availableDepartments.length > 0) {
          departmentId = availableDepartments[0].id;
        } else {
          departmentId = "";
        }
      } else if (administrationDepartment) {
        departmentId = administrationDepartment.id;
      }
      return { ...prev, role: newRole, departmentId };
    });
  };

  const handleDepartmentChange = (e) => {
    setForm((prev) => ({ ...prev, departmentId: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
        <DialogContent dividers>
          {isEdit && loadingDetail ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2, width: "100%", pt: 1 }}>
              <TextField
                label="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
              />
              <TextField
                label="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
              />
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={form.role}
                  label="Role"
                  onChange={handleRoleChange}
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.replace(/_/g, " ").toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error">
                    {errors.role}
                  </Typography>
                )}
              </FormControl>
              {loadingDepartments ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl
                  fullWidth
                  error={!!errors.departmentId}
                  disabled={form.role !== UserRole.DEPARTMENT_HEAD}
                >
                  <InputLabel id="department-select-label">
                    Department
                  </InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={form.departmentId}
                    label="Department"
                    onChange={handleDepartmentChange}
                  >
                    {form.role === UserRole.DEPARTMENT_HEAD ? (
                      availableDepartments.length > 0 ? (
                        availableDepartments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No departments available
                        </MenuItem>
                      )
                    ) : (
                      <MenuItem value={administrationDepartment?.id || ""}>
                        {administrationDepartment?.name || "Administration"}
                      </MenuItem>
                    )}
                  </Select>
                  {errors.departmentId && (
                    <Typography variant="caption" color="error">
                      {errors.departmentId}
                    </Typography>
                  )}
                  {form.role && form.role !== UserRole.DEPARTMENT_HEAD && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        color: "text.secondary",
                      }}
                    >
                      This role is automatically assigned to the Administration
                      department
                    </Typography>
                  )}
                </FormControl>
              )}
              {!isEdit && (
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                />
              )}
              {errors.submit && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.submit}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              createUser.isLoading || updateUser.isLoading || loadingDepartments
            }
          >
            {isEdit
              ? updateUser.isLoading
                ? "Saving..."
                : "Save"
              : createUser.isLoading
              ? "Creating..."
              : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default UserFormDialog;
