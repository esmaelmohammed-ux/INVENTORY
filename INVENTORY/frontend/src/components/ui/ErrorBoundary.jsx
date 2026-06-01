import { Component } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ReportProblem } from "@mui/icons-material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: "600px",
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            <ReportProblem sx={{ fontSize: 64, color: "error.main", mb: 2 }} />

            <Typography variant="h5" gutterBottom color="error">
              Something went wrong
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We apologize for the inconvenience. Please try refreshing the page
              or contact support if the problem persists.
            </Typography>

            {import.meta.env.DEV && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  textAlign: "left",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                <Typography variant="caption" component="div">
                  <strong>Error:</strong> {this.state.error?.toString()}
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  <strong>Stack:</strong> {this.state.errorInfo?.componentStack}
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                color="primary"
              >
                Try Again
              </Button>

              <Button variant="outlined" onClick={this.handleReload}>
                Reload Page
              </Button>

              <Button
                variant="text"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
