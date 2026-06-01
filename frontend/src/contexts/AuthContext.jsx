import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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
