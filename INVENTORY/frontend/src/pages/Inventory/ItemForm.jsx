import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Inventory as ItemIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateItem, useUpdateItem, useItem } from "../../services/queries";

const ItemForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    quantity: 0,
    minQuantity: 0,
    unit: "",
  });
  const [errors, setErrors] = useState({});

  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();

  const { id } = useParams();
  const isEdit = editMode;
  const { data: itemData, isLoading: loadingItem, error: itemError } = useItem(
    isEdit ? id : null
  );

  useEffect(() => {
    if (isEdit && itemData) {
      setFormData({
        name: itemData.name || "",
        description: itemData.description || "",
        categoryId: itemData.categoryId || itemData.category?.id || "",
        quantity: itemData.quantity || 0,
        minQuantity: itemData.minQuantity || 0,
        unit: itemData.unit || "",
      });
    }
  }, [isEdit, itemData]);

  
  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Item name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.quantity < 0)
      newErrors.quantity = "Quantity cannot be negative";
    if (formData.minQuantity < 0)
      newErrors.minQuantity = "Minimum quantity cannot be negative";
    if (!formData.unit) newErrors.unit = "Unit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validate()) return;
      if (isEdit) {
        await updateItemMutation.mutateAsync({ id, ...formData });
      } else {
        await createItemMutation.mutateAsync(formData);
      }
      navigate("/inventory");
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const renderForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Item Name"
          value={formData.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={handleChange("description")}
          multiline
          rows={3}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.categoryId}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={formData.categoryId}
            label="Category *"
            onChange={handleChange("categoryId")}
          >
            <MenuItem value={1}>Office Supplies</MenuItem>
            <MenuItem value={2}>IT Equipment</MenuItem>
            <MenuItem value={3}>Cleaning Supplies</MenuItem>
            <MenuItem value={4}>Maintenance Tools</MenuItem>
            <MenuItem value={5}>Medical Supplies</MenuItem>
          </Select>
          {errors.categoryId && (
            <Typography variant="caption" color="error">
              {errors.categoryId}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.unit}>
          <InputLabel>Unit of Measurement *</InputLabel>
          <Select
            value={formData.unit}
            label="Unit of Measurement *"
            onChange={handleChange("unit")}
          >
            <MenuItem value="piece">Piece</MenuItem>
            <MenuItem value="box">Box</MenuItem>
            <MenuItem value="pack">Pack</MenuItem>
            <MenuItem value="ream">Ream</MenuItem>
            <MenuItem value="bottle">Bottle</MenuItem>
            <MenuItem value="kit">Kit</MenuItem>
            <MenuItem value="unit">Unit</MenuItem>
            <MenuItem value="meter">Meter</MenuItem>
            <MenuItem value="liter">Liter</MenuItem>
          </Select>
          {errors.unit && (
            <Typography variant="caption" color="error">
              {errors.unit}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Current Quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange("quantity")}
          error={!!errors.quantity}
          helperText={errors.quantity}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Minimum Quantity"
          type="number"
          value={formData.minQuantity}
          onChange={handleChange("minQuantity")}
          error={!!errors.minQuantity}
          helperText={errors.minQuantity}
          inputProps={{ min: 0 }}
        />
      </Grid>
    </Grid>
  );

  if (isEdit && loadingItem) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <Typography variant="body1">Loading item...</Typography>
      </Box>
    );
  }

  if (isEdit && itemError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading item: {itemError.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/inventory")}
          variant="outlined"
        >
          Back to Inventory
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          <ItemIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          {isEdit ? "Edit Item" : "Add New Item"}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {renderForm()}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={createItemMutation.isLoading || updateItemMutation.isLoading}
          >
            {createItemMutation.isLoading || updateItemMutation.isLoading
              ? "Saving..."
              : isEdit
              ? "Update Item"
              : "Create Item"}
          </Button>
        </Box>
      </Paper>

      {(createItemMutation.error || updateItemMutation.error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error:{" "}
          {createItemMutation.error?.message ||
            updateItemMutation.error?.message}
        </Alert>
      )}
    </Box>
  );
};

export default ItemForm;
