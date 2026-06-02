import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
// This component is a protected route wrapper that checks if the user is authenticated and has the required roles to access a specific route. If the user is not authenticated, they are redirected to the login page. If they are authenticated but do not have the necessary roles, they are redirected to the dashboard. If they meet all requirements, the child components are rendered.
const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
