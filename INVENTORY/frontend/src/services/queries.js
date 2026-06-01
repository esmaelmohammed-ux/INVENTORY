import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// ITEM MUTATIONS
export const useItems = (params = {}) => {
  return useQuery({
    queryKey: ["items", params],
    queryFn: async () => {
      const response = await api.get("/items", { params });
      return response.data;
    },
  });
};
export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...itemData }) => api.put(`/items/${id}`, itemData),
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => api.delete(`/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
    },
  });
};
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemData) => api.post("/items", itemData),
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
    },
  });
};

// Single item detail
export const useItem = (itemId) => {
  return useQuery({
    queryKey: ["items", itemId],
    queryFn: async () => {
      try {
        const response = await api.get(`/items/${itemId}`);
        return response.data;
      } catch (err) {
        // Fallback: backend may not expose GET /items/:id; fetch all and find locally
        const list = await api.get(`/items`);
        const it = (list.data || []).find((x) => String(x.id || x._id) === String(itemId));
        if (!it) throw err;
        return it;
      }
    },
    enabled: !!itemId,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => api.post("/auth/login", credentials),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
    refetchInterval: 300000,
  });
};

// REQUISITION MUTATIONS
export const useRequisitions = (params = {}) => {
  return useQuery({
    queryKey: ["requisitions", params],
    queryFn: async () => {
      const response = await api.get("/requisitions", { params });
      return response.data;
    },
  });
};

export const useRequisitionDetail = (requisitionId) => {
  return useQuery({
    queryKey: ["requisitions", requisitionId],
    queryFn: async () => {
      const response = await api.get(`/requisitions/${requisitionId}`);
      return response.data;
    },
    enabled: !!requisitionId,
  });
};

export const useCreateRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requisitionData) => api.post("/requisitions", requisitionData),
    onSuccess: () => {
      queryClient.invalidateQueries(["requisitions"]);
    },
  });
};

export const useUpdateRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...requisitionData }) =>
      api.put(`/requisitions/${id}`, requisitionData),
    onSuccess: () => {
      queryClient.invalidateQueries(["requisitions"]);
    },
  });
};
export const useFulfillRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requisitionId) =>
      api.post(`/requisitions/${requisitionId}/fulfill`),
    onSuccess: () => {
      queryClient.invalidateQueries(["requisitions"]);
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
    },
  });
};
export const useUpdateRequisitionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reasonForRejection }) =>
      api.patch(`/requisitions/${id}/status`, { status, reasonForRejection }),
    onSuccess: () => {
      queryClient.invalidateQueries(["requisitions"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
    },
  });
};

export const useDeleteRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requisitionId) => api.delete(`/requisitions/${requisitionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["requisitions"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
    },
  });
};

// SERVICE REQUEST MUTATIONS
export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceRequestData) =>
      api.post("/service-requests", serviceRequestData),
    onSuccess: () => {
      queryClient.invalidateQueries(["service-requests"]);
    },
  });
};

export const useUpdateServiceRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reasonForRejection }) =>
      api.patch(`/service-requests/${id}/status`, {
        status,
        reasonForRejection,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["service-requests"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
      queryClient.invalidateQueries(["service-request-stats"]);
    },
  });
};

export const useDeleteServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceRequestId) => api.delete(`/service-requests/${serviceRequestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["service-requests"]);
      queryClient.invalidateQueries(["dashboard-stats"]);
      queryClient.invalidateQueries(["service-request-stats"]);
    },
  });
};

// SERVICE REQUEST QUERIES
export const useServiceRequests = (params = {}) => {
  return useQuery({
    queryKey: ["service-requests", params],
    queryFn: async () => {
      const response = await api.get("/service-requests", { params });
      return response.data;
    },
  });
};

export const useServiceRequestStats = () => {
  return useQuery({
    queryKey: ["service-request-stats"],
    queryFn: async () => {
      const response = await api.get("/service-requests/stats");
      return response.data;
    },
    refetchInterval: 300000,
  });
};

export const useServiceRequestDetail = (id) => {
  return useQuery({
    queryKey: ["service-requests", id],
    queryFn: async () => {
      const response = await api.get(`/service-requests/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// TRANSACTION MUTATIONS
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionData) => api.post("/transactions", transactionData),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["items"]);
    },
  });
};
export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await api.get("/transactions", { params });
      return response.data;
    },
  });
};

export const useTransactionStats = (params = {}) => {
  return useQuery({
    queryKey: ["transaction-stats", params],
    queryFn: async () => {
      const response = await api.get("/transactions/stats", { params });
      return response.data;
    },
    refetchInterval: 300000,
  });
};
export const useTransactionDetail = (transactionId) => {
  return useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: async () => {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    },
    enabled: !!transactionId,
  });
};
export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjustmentData) =>
      api.post("/transactions/adjust", adjustmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["items"]);
    },
  });
};
// USER MUTATIONS (Admin only)
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    },
    refetchInterval: 300000,
  });
};
export const useDetailUser = (userId) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => api.post("/auth/register", userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...userData }) => api.put(`/users/${id}`, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
};

//Department Queries and Mutations (admin only)
export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.get("/departments");
      return response.data;
    },
    refetchInterval: 300000,
  });
};
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentData) => api.post("/departments", departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
    },
  });
};
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...departmentData }) => api.put(`/departments/${id}`, departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId) => api.delete(`/departments/${departmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
    },
  });
};

// AUDIT LOG QUERIES
export const useAuditLogs = (params = {}) => {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await api.get("/audit-logs", { params });
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute for audit logs
  });
};

export const useAuditStats = (params = {}) => {
  return useQuery({
    queryKey: ["audit-stats", params],
    queryFn: async () => {
      const response = await api.get("/audit-logs/stats", { params });
      return response.data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

export const useAuditLogDetail = (auditLogId) => {
  return useQuery({
    queryKey: ["audit-logs", auditLogId],
    queryFn: async () => {
      const response = await api.get(`/audit-logs/${auditLogId}`);
      return response.data;
    },
    enabled: !!auditLogId,
  });
};

export const useAuditTrail = (entityType, entityId) => {
  return useQuery({
    queryKey: ["audit-trail", entityType, entityId],
    queryFn: async () => {
      const response = await api.get(`/audit-logs/trail/${entityType}/${entityId}`);
      return response.data;
    },
    enabled: !!(entityType && entityId),
  });
};

export const useUserActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: ["user-activity", userId, params],
    queryFn: async () => {
      const response = await api.get(`/audit-logs/user/${userId}`, { params });
      return response.data;
    },
    enabled: !!userId,
  });
};

// AUDIT & REPORTING QUERIES
export const useAuditReport = (params = {}) => {
  return useQuery({
    queryKey: ["audit-report", params],
    queryFn: async () => {
      const response = await api.get("/reports/audit", { params });
      return response.data;
    },
    enabled: !!Object.keys(params).length || params.autoLoad,
  });
};

export const useInventoryReport = (params = {}) => {
  return useQuery({
    queryKey: ["inventory-report", params],
    queryFn: async () => {
      const response = await api.get("/reports/inventory", { params });
      return response.data;
    },
    enabled: !!Object.keys(params).length || params.autoLoad,
  });
};

export const useRequisitionReport = (params = {}) => {
  return useQuery({
    queryKey: ["requisition-report", params],
    queryFn: async () => {
      const response = await api.get("/reports/requisitions", { params });
      return response.data;
    },
    enabled: !!Object.keys(params).length || params.autoLoad,
  });
};

export const useTransactionReport = (params = {}) => {
  return useQuery({
    queryKey: ["transaction-report", params],
    queryFn: async () => {
      const response = await api.get("/reports/transactions", { params });
      return response.data;
    },
    enabled: !!Object.keys(params).length || params.autoLoad,
  });
};

// Download reports
export const useDownloadReport = () => {
  return useMutation({
    mutationFn: async ({ type, params }) => {
      const response = await api.get(`/reports/${type}`, {
        params: { ...params, format: 'csv' },
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
  });
};

// Advanced audit statistics
export const useAdvancedAuditStats = (params = {}) => {
  return useQuery({
    queryKey: ["advanced-audit-stats", params],
    queryFn: async () => {
      const [auditData, transactionStats] = await Promise.all([
        api.get("/reports/audit", { params: { ...params, limit: 1000 } }),
        api.get("/transactions/stats", { params })
      ]);
      
      return {
        auditTrail: auditData.data,
        transactionStats: transactionStats.data
      };
    },
    refetchInterval: 300000, // 5 minutes
  });
};

// Compliance metrics
export const useComplianceMetrics = (params = {}) => {
  return useQuery({
    queryKey: ["compliance-metrics", params],
    queryFn: async () => {
      const [requisitions, transactions, serviceRequests] = await Promise.all([
        api.get("/requisitions", { params: { ...params, limit: 1000 } }),
        api.get("/transactions", { params: { ...params, limit: 1000 } }),
        api.get("/service-requests", { params: { ...params, limit: 1000 } })
      ]);
      
      return {
        requisitions: requisitions.data,
        transactions: transactions.data,
        serviceRequests: serviceRequests.data
      };
    },
    refetchInterval: 300000,
  });
};
