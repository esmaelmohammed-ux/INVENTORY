import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateServiceRequest, useServiceRequestDetail } from "../../services/queries";
import { useAuth } from "../../contexts/AuthContext";

const ServiceRequestForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    items: [],
  });
  const isEdit = editMode;
  const { data: detail } = useServiceRequestDetail(isEdit ? id : null);

  const createReq = useCreateServiceRequest();

  // Populate edit
  useEffect(() => {
    if (isEdit && detail && !formData.title) {
      setFormData({ title: detail.title || "", description: detail.description || "", items: [] });
    }
  }, [isEdit, detail, formData.title]);

  const handleSubmit = async () => {
    if (!formData.title) return;
    try {
      const payload = { title: formData.title, description: formData.description };
      await createReq.mutateAsync(payload);
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-service-requests" : "/service-requests");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-service-requests" : "/service-requests")} variant="outlined">
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isEdit ? "Edit Service Request" : "Create Service Request"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={createReq.isLoading}
            sx={{ height: 56 }}
          >
            {createReq.isLoading ? "Saving..." : isEdit ? "Update Request" : "Create Request"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceRequestForm;
