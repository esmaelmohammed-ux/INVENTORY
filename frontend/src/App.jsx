import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { AppThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import LoginForm from "./components/auth/LoginForm";
import Dashboard from "./pages/Dashboard/Dashboard";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import ItemList from "./pages/Inventory/ItemList";
import ItemForm from "./pages/Inventory/ItemForm";
import InventoryStats from "./pages/Inventory/InventoryStats";
import ItemDetail from "./pages/Inventory/ItemDetail";
import RequisitionList from "./pages/Requisitions/RequisitionList";
import RequisitionForm from "./pages/Requisitions/RequisitionForm";
import RequisitionDetail from "./pages/Requisitions/RequisitionDetail";
import FulfillRequisitions from "./pages/Requisitions/FulfillRequisitions";
import ReportBuilder from "./pages/Reports/ReportBuilder";
import ReportView from "./pages/Reports/ReportView";
import Profile from "./pages/Profile/Profile";
import UserManagment from "./pages/Userss/UserManagment";
import DepartmentManagement from "./pages/Admin/DepartmentManagement";
import TransactionList from "./pages/Transactions/TransactionList";
import ServiceRequestList from "./pages/ServiceRequests/ServiceRequestList";
import ServiceRequestForm from "./pages/ServiceRequests/ServiceRequestForm";
import ServiceRequestDetail from "./pages/ServiceRequests/ServiceRequestDetail";
import DepartmentHeadRequisitions from "./pages/Requisitions/DepartmentHeadRequisitions";
import DepartmentHeadServiceRequests from "./pages/ServiceRequests/DepartmentHeadServiceRequests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner message="Initializing application..." />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<ItemList />} />
                    <Route path="/inventory/new" element={<ItemForm />} />
                    <Route
                      path="/inventory/edit/:id"
                      element={<ItemForm editMode />}
                    />
                    <Route path="/inventory/:id" element={<ItemDetail />} />
                    <Route
                      path="/inventory/stats"
                      element={<InventoryStats />}
                    />
                    <Route path="/requisitions" element={<RequisitionList />} />
                    <Route
                      path="/my-requisitions"
                      element={
                        <ProtectedRoute requiredRoles={["DEPARTMENT_HEAD"]}>
                          <DepartmentHeadRequisitions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/requisitions/new"
                      element={<RequisitionForm />}
                    />
                    <Route
                      path="/requisitions/edit/:id"
                      element={<RequisitionForm editMode />}
                    />
                    <Route
                      path="/requisitions/:id"
                      element={<RequisitionDetail />}
                    />
                    <Route
                      path="/requisitions/fulfill"
                      element={
                        <ProtectedRoute requiredRoles={["STOREKEEPER"]}>
                          <FulfillRequisitions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <UserManagment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/departments"
                      element={
                        <ProtectedRoute requiredRoles={["ADMIN"]}>
                          <DepartmentManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/reports" element={<ReportBuilder />} />
                    <Route path="/reports/:id" element={<ReportView />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/transactions" element={<TransactionList />} />
                    {/* Service Requests */}
                    <Route path="/service-requests" element={<ServiceRequestList />} />
                    <Route
                      path="/my-service-requests"
                      element={
                        <ProtectedRoute requiredRoles={["DEPARTMENT_HEAD"]}>
                          <DepartmentHeadServiceRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/service-requests/new" element={<ServiceRequestForm />} />
                    <Route path="/service-requests/:id" element={<ServiceRequestDetail />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="*" element={<div>Page not found</div>} />
                  </Routes>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>
          <CssBaseline />
          <AppContent />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
