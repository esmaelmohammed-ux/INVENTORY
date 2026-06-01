import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import { useDetailUser } from "../../services/queries.js";

const initials = (nameOrEmail = "") => {
  const parts = nameOrEmail.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

function UserDetailsDialog({ open, onClose, userId }) {
  const { data: detail, isLoading } = useDetailUser(userId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User details</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : detail ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar sx={{ width: 56, height: 56 }}>
                {initials(detail.firstName || detail.email)}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {detail.firstName}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {detail.lastName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {detail.email}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2">Role</Typography>
              <Typography>{detail.role || "user"}</Typography>
            </Box>
            {detail.department ? (
              <Box>
                <Typography variant="subtitle2">Department</Typography>
                <Typography>{detail.department.name}</Typography>
              </Box>
            ) : null}

            <Box>
              <Typography variant="subtitle2">Joined</Typography>
              <Typography>
                {detail.createdAt
                  ? new Date(detail.createdAt).toLocaleString()
                  : "-"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">No user selected</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDetailsDialog;
