import api from "./api";
import { jwtDecode } from "jwt-decode";

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const { token, user } = response.data;

    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { user, token };
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  isTokenExpired: (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};
