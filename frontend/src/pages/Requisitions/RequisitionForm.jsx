import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useItems, useCreateRequisition, useUpdateRequisition, useRequisitionDetail } from "../../services/queries";
import { useAuth } from "../../contexts/AuthContext";

const RequisitionForm = ({ editMode = false, requisition = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: requisition?.title || "",
    description: requisition?.description || "",
    items: requisition?.items || [],
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const isEdit = editMode;

  const { data: items, isLoading } = useItems();
  const { data: detail, isLoading: loadingDetail } = useRequisitionDetail(
    isEdit ? id : null
  );

  const createRequisition = useCreateRequisition();
  const updateRequisition = useUpdateRequisition();

  // Populate for edit mode
  useEffect(() => {
    if (isEdit && detail) {
      setFormData({
        title: detail.title || "",
        description: detail.description || "",
        items:
          detail.items?.map((ri) => ({
            itemId: ri.itemId || ri.item?.id,
            quantity: ri.quantity,
            item: ri.item,
          })) || [],
      });
    }
  }, [isEdit, detail]);

  const handleAddItem = (item, quantity) => {
    if (quantity > 0) {
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, { itemId: item.id, quantity, item }],
      }));
    }
  };

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.itemId !== itemId),
    }));
  };

  const handleSubmit = async () => {
    // basic validation
    const hasItems = formData.items && formData.items.length > 0;
    if (!formData.title || !hasItems) return;

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        items: formData.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      };
      if (isEdit) {
        await updateRequisition.mutateAsync({ id, ...payload });
      } else {
        await createRequisition.mutateAsync(payload);
      }
      navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-requisitions" : "/requisitions");
    } catch (e) {
      // Error presentation kept minimal here; can add Snackbar
      console.error(e);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(user?.role === "DEPARTMENT_HEAD" ? "/my-requisitions" : "/requisitions")}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isEdit ? "Edit Requisition" : "Create Requisition"}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Requisition Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Selected Items ({formData.items.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {formData.items.map((item) => (
              <Card key={item.itemId} variant="outlined" sx={{ mb: 1 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {item.item?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quantity: {item.quantity} {item.item?.unit}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(item.itemId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
            {formData.items.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No items selected
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Available Items
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {items?.map((item) => (
                <Card key={item.id} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent>
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Stock: {item.quantity} {item.unit}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Qty"
                        inputProps={{ min: 1, max: item.quantity }}
                        sx={{ width: 80 }}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value);
                          if (quantity > 0) {
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.id]: quantity,
                            }));
                          }
                        }}
                      />
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          handleAddItem(item, selectedItems[item.id] || 1)
                        }
                      >
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={createRequisition.isLoading || updateRequisition.isLoading || loadingDetail}
            sx={{ mt: 2, height: 56 }}
          >
            {createRequisition.isLoading || updateRequisition.isLoading
              ? "Saving..."
              : isEdit
              ? "Update Requisition"
              : "Create Requisition"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RequisitionForm;
