import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth";
// This context provides authentication-related state and functions to the entire application. It manages the current user's information, loading state, and provides methods for logging in and out. The context also includes utility functions to check if a user is authenticated and if they have specific roles, which can be used for role-based access control throughout the app.
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();

    if (token && currentUser) {
      if (authService.isTokenExpired(token)) {
        authService.logout();
        setUser(null);
      } else {
        setUser(currentUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
