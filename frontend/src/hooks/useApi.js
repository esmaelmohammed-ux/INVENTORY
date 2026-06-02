import { useState } from "react";
// This custom hook provides a standardized way to handle API calls in the application. It manages loading and error states, allowing components to easily call APIs and handle responses without having to repeat the same logic for each API call. The `callApi` function takes an API call as an argument, executes it, and updates the loading and error states accordingly. It also provides a `clearError` function to reset the error state when needed.
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
