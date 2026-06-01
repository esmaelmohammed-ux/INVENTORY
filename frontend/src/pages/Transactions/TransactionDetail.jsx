import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  useTheme,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Notes as NotesIcon,
  CalendarToday as CalendarIcon,
  Label as LabelIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

const TransactionDetail = ({ transaction }) => {
  const theme = useTheme();

  const getTypeColor = (type) => {
    const colors = {
      RECEIVE: "success",
      ISSUE: "error",
      ADJUST: "warning",
    };
    return colors[type] || "default";
  };

  const getTypeLabel = (type) => {
    const labels = {
      RECEIVE: "Stock Received",
      ISSUE: "Stock Issued",
      ADJUST: "Stock Adjusted",
    };
    return labels[type] || type;
  };

  const InfoCard = ({ title, icon, children, sx = {} }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(10px)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[2],
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight="600">
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );

  const InfoItem = ({ icon, primary, secondary, color = "primary" }) => (
    <ListItem sx={{ px: 0, py: 1.5 }}>
      <ListItemIcon sx={{ minWidth: 44 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: `${color}.main`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight="500" color="text.primary">
            {primary}
          </Typography>
        }
        secondary={
          <Typography
            variant="body1"
            fontWeight="600"
            color="text.primary"
            sx={{ mt: 0.5 }}
          >
            {secondary || "N/A"}
          </Typography>
        }
        sx={{ m: 0 }}
      />
    </ListItem>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
          p: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            fontWeight="700"
            color="primary"
            gutterBottom
          >
            Transaction #{transaction.id}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed view of inventory transaction
          </Typography>
        </Box>
        <Chip
          label={getTypeLabel(transaction.type)}
          color={getTypeColor(transaction.type)}
          size="large"
          sx={{
            fontSize: "1rem",
            px: 2,
            py: 1.5,
            fontWeight: 600,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Item Information */}
        <Grid item xs={12} lg={6}>
          <InfoCard title="Item Information" icon={<InventoryIcon />}>
            <List sx={{ p: 0 }}>
              <InfoItem
                icon={<InventoryIcon />}
                primary="Item Name"
                secondary={transaction.item?.name}
              />
              <InfoItem
                icon={<CategoryIcon />}
                primary="Category"
                secondary={transaction.item?.category?.name}
              />
              <InfoItem
                icon={<DescriptionIcon />}
                primary="Description"
                secondary={
                  transaction.item?.description || "No description available"
                }
              />
            </List>
          </InfoCard>
        </Grid>

        {/* Transaction Details */}
        <Grid item xs={12} lg={6}>
          <InfoCard title="Transaction Details" icon={<ReceiptIcon />}>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      color="text.primary"
                    >
                      Quantity
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="h5"
                      fontWeight="700"
                      color={
                        transaction.type === "ISSUE"
                          ? "error.main"
                          : "success.main"
                      }
                      sx={{ mt: 1 }}
                    >
                      {transaction.type === "ISSUE" ? "-" : "+"}
                      {Math.abs(transaction.quantity)} {transaction.item?.unit}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </ListItem>
              <InfoItem
                icon={<CalendarIcon />}
                primary="Date & Time"
                secondary={new Date(transaction.createdAt).toLocaleString()}
              />
              {transaction.notes && (
                <InfoItem
                  icon={<NotesIcon />}
                  primary="Notes"
                  secondary={transaction.notes}
                />
              )}
            </List>
          </InfoCard>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} lg={6}>
          <InfoCard title="Performed By" icon={<PersonIcon />}>
            <List sx={{ p: 0 }}>
              <InfoItem
                icon={<BadgeIcon />}
                primary="Name"
                secondary={`${transaction.user?.firstName} ${transaction.user?.lastName}`}
              />
              <InfoItem
                icon={<LabelIcon />}
                primary="Role"
                secondary={transaction.user?.role}
              />
              <InfoItem
                icon={<EmailIcon />}
                primary="Email"
                secondary={transaction.user?.email}
              />
            </List>
          </InfoCard>
        </Grid>

        {/* Related Requisition */}
        {transaction.requisition && (
          <Grid item xs={12} lg={6}>
            <InfoCard title="Related Requisition" icon={<ReceiptIcon />}>
              <List sx={{ p: 0 }}>
                <InfoItem
                  icon={<BadgeIcon />}
                  primary="Requisition ID"
                  secondary={`#${transaction.requisition.id}`}
                />
                <InfoItem
                  icon={<DescriptionIcon />}
                  primary="Title"
                  secondary={transaction.requisition.title}
                />
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LabelIcon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        color="text.primary"
                      >
                        Status
                      </Typography>
                    }
                    secondary={
                      <Chip
                        label={transaction.requisition.status}
                        color={
                          transaction.requisition.status === "APPROVED"
                            ? "success"
                            : transaction.requisition.status === "PENDING"
                            ? "warning"
                            : "error"
                        }
                        size="medium"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          minWidth: 100,
                        }}
                      />
                    }
                    sx={{ m: 0 }}
                  />
                </ListItem>
              </List>
            </InfoCard>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Additional Information */}
      <InfoCard
        title="Additional Information"
        icon={<DescriptionIcon />}
        sx={{ mb: 2 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="500"
              >
                Transaction ID
              </Typography>
              <Typography variant="body1" fontWeight="600">
                #{transaction.id}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="500"
              >
                Item ID
              </Typography>
              <Typography variant="body1" fontWeight="600">
                #{transaction.itemId}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="500"
              >
                User ID
              </Typography>
              <Typography variant="body1" fontWeight="600">
                #{transaction.userId}
              </Typography>
            </Box>
          </Grid>
          {transaction.requisitionId && (
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Requisition ID
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  #{transaction.requisitionId}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </InfoCard>
    </Box>
  );
};

export default TransactionDetail;
