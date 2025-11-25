import api, { API_ROUTES } from "./api";

// Student Complaint API
export const studentComplaintAPI = {
  // Submit a new complaint
  submitComplaint: async (tenantId: string, data: any) => {
    try {
      console.log("🔵 API Call: submitComplaint", { tenantId, data });
      const response = await api.post(API_ROUTES.STUDENT_COMPLAINTS_SUBMIT(tenantId), data);
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get my complaints with filters
  getMyComplaints: async (tenantId: string, filters?: any) => {
    try {
      console.log("🔵 API Call: getMyComplaints", { tenantId, filters });
      const response = await api.get(API_ROUTES.STUDENT_COMPLAINTS_LIST(tenantId), {
        params: filters,
      });
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get complaint detail by ID
  getComplaintDetail: async (tenantId: string, complaintId: string) => {
    try {
      console.log("🔵 API Call: getComplaintDetail", { tenantId, complaintId });
      
      if (!complaintId || complaintId === 'undefined') {
        throw new Error("Complaint ID is required");
      }
      
      const url = API_ROUTES.STUDENT_COMPLAINT_DETAIL(tenantId, complaintId);
      console.log("🔵 Request URL:", url);
      
      const response = await api.get(url);
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get comments for a complaint
  getComments: async (tenantId: string, complaintId: string) => {
    try {
      console.log("🔵 API Call: getComments", { tenantId, complaintId });
      const response = await api.get(API_ROUTES.STUDENT_COMPLAINT_COMMENTS(tenantId, complaintId));
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Add comment to a complaint
  addComment: async (tenantId: string, complaintId: string, data: any) => {
    try {
      console.log("🔵 API Call: addComment", { tenantId, complaintId, data });
      const response = await api.post(
        API_ROUTES.STUDENT_COMPLAINT_ADD_COMMENT(tenantId, complaintId),
        data
      );
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },
};

// Admin Complaint API
export const adminComplaintAPI = {
  // Get all complaints with filters
  getComplaints: async (tenantId: string, filters?: any) => {
    try {
      console.log("🔵 API Call: getComplaints", { tenantId, filters });
      const response = await api.get(API_ROUTES.ADMIN_COMPLAINTS_LIST(tenantId), {
        params: filters,
      });
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get complaint detail by ID
  getComplaintDetail: async (tenantId: string, complaintId: string) => {
    try {
      console.log("🔵 API Call: getComplaintDetail", { tenantId, complaintId });
      
      if (!complaintId || complaintId === 'undefined') {
        throw new Error("Complaint ID is required");
      }
      
      const url = API_ROUTES.ADMIN_COMPLAINT_DETAIL(tenantId, complaintId);
      console.log("🔵 Request URL:", url);
      
      const response = await api.get(url);
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Update complaint status
  updateStatus: async (tenantId: string, complaintId: string, status: string) => {
    try {
      console.log("🔵 API Call: updateStatus", { tenantId, complaintId, status });
      const response = await api.patch(
        API_ROUTES.ADMIN_COMPLAINT_UPDATE_STATUS(tenantId, complaintId),
        { status }
      );
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Resolve complaint
  resolveComplaint: async (tenantId: string, complaintId: string, data: any) => {
    try {
      console.log("🔵 API Call: resolveComplaint", { tenantId, complaintId, data });
      const response = await api.patch(
        API_ROUTES.ADMIN_COMPLAINT_RESOLVE(tenantId, complaintId),
        data
      );
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Add comment
  addComment: async (tenantId: string, complaintId: string, data: any) => {
    try {
      console.log("🔵 API Call: addComment", { tenantId, complaintId, data });
      const response = await api.post(
        API_ROUTES.ADMIN_COMPLAINT_ADD_COMMENT(tenantId, complaintId),
        data
      );
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get comments
  getComments: async (tenantId: string, complaintId: string) => {
    try {
      console.log("🔵 API Call: getComments", { tenantId, complaintId });
      const response = await api.get(
        API_ROUTES.ADMIN_COMPLAINT_COMMENTS(tenantId, complaintId)
      );
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get complaint statistics
  getStats: async (tenantId: string) => {
    try {
      console.log("🔵 API Call: getStats", { tenantId });
      const response = await api.get(API_ROUTES.ADMIN_COMPLAINT_STATS(tenantId));
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get complaints by category
  getByCategory: async (tenantId: string) => {
    try {
      console.log("🔵 API Call: getByCategory", { tenantId });
      const response = await api.get(API_ROUTES.ADMIN_COMPLAINT_BY_CATEGORY(tenantId));
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Get complaint report
  getReport: async (tenantId: string, filters?: any) => {
    try {
      console.log("🔵 API Call: getReport", { tenantId, filters });
      const response = await api.get(API_ROUTES.ADMIN_COMPLAINT_REPORT(tenantId), {
        params: filters,
      });
      console.log("🟢 API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 API Error:", error.response?.data || error);
      throw error;
    }
  },
};