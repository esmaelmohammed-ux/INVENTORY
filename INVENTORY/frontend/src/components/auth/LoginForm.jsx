import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeContext } from "../../contexts/ThemeContext";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { mode } = useThemeContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(credentials);

      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mode === "dark" ? "#121212" : "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "80%",
          maxWidth: "1400px",
          height: "75vh",
          minHeight: "600px",
          maxHeight: "900px",
          borderRadius: { md: 3 },
          overflow: "hidden",
          boxShadow: { md: 8 },
        }}
      >
        {/* Left Side */}
        <Box
          sx={{
            flex: { xs: 1, md: "0 0 42%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: 3, sm: 4, md: 6 },
            backgroundColor: mode === "dark" ? "#1a1a1a" : "#fafafa",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                <img
                  src="/logo.png"
                  alt="App Logo"
                  style={{ width: 120, height: 120, objectFit: "contain" }}
                />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome Back
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  pb: 1,
                  pt: 2,
                  mb: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Box>

            {/* Sign in link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Having any problems or Don't have an account ?{" "}
                <Link href="#" sx={{ textDecoration: "none", fontWeight: 600 }}>
                  Contact the Admin{" "}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side*/}
        <Box
          sx={{
            flex: "0 0 58%",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 6,
            backgroundColor: mode === "dark" ? "#0f1419" : "#1a237e",
            color: "white",
          }}
        >
          <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 4,
                lineHeight: 1.2,
              }}
            >
              Smart Inventory Managment System{" "}
            </Typography>

            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                padding: 3,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.8 }}>
                Inventory Managment System{" "}
              </Typography>
              <img src="/inv.svg" alt="Inventory Illustration" width="100%" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;
