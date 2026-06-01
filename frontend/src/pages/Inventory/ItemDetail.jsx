import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useItem } from "../../services/queries";
import { useAuth } from "../../contexts/AuthContext";
import { getCategoryName } from "../../utils/helpers";

const Stat = ({ label, value, color }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" color={color || "text.primary"}>
      {value}
    </Typography>
  </Paper>
);

const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: item, isLoading, error } = useItem(id);

  const canEdit = user?.role === "ADMIN" || user?.role === "STOREKEEPER";

  const renderStatusChip = (it) => {
    const isLow = (it?.quantity ?? 0) <= (it?.minQuantity ?? 0);
    return (
      <Chip
        icon={isLow ? <WarningIcon /> : <CheckIcon />}
        label={isLow ? "LOW STOCK" : "IN STOCK"}
        color={isLow ? "error" : "success"}
        variant={isLow ? "filled" : "outlined"}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate("/inventory")}>
          Back to Inventory
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InventoryIcon /> Item Details
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          {!isLoading && item && renderStatusChip(item)}
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/inventory/edit/${id}`)}
            >
              Edit Item
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {isLoading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <Skeleton variant="rounded" height={72} />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Typography color="error">Error loading item: {error.message}</Typography>
        ) : !item ? (
          <Typography color="text.secondary">Item not found.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {item.name}
                </Typography>
                {item.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                  {renderStatusChip(item)}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Stat label="Category" value={getCategoryName(item.categoryId) || item.category?.name || "—"} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stat label="Unit" value={item.unit || "—"} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stat label="Quantity" value={`${item.quantity} ${item.unit || ""}`} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stat label="Minimum" value={`${item.minQuantity} ${item.unit || ""}`} />
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Placeholder for related content (future phases) */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Recent transactions for this item will appear here in a later phase.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ItemDetail;
