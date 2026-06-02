import { useState } from "react";
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiCall) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    callApi,
    clearError: () => setError(null),
  };
};
