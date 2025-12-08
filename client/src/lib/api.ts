import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    // ✅ Get auth token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // ✅ FIXED: Get tenant ID from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.tenantId) {
          config.headers['x-tenant-id'] = parsedUser.tenantId;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define the base URL for all APIs
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ROUTES = {
  // ============================================
  // Auth Routes
  // ============================================
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  ONBOARD_ORG: `${BASE_URL}/api/auth/onboarding/organization`,
  ONBOARD_ADMIN_PROFILE: `${BASE_URL}/api/auth/onboarding/admin-profile`,
  ONBOARD_PAYMENT: `${BASE_URL}/api/auth/onboarding/payment`,
  ONBOARD_COMPLETE: `${BASE_URL}/api/auth/onboarding/complete`,

  // ============================================
  // User Profile Routes
  // ============================================
  USER_PROFILE: `${BASE_URL}/api/profile/profile`,
  USER_CHANGE_PASSWORD: `${BASE_URL}/api/profile/change-password`,
  USER_PROFILE_PICTURE: `${BASE_URL}/api/profile/profile-picture`,

  // ============================================
  // Student Profile Routes
  // ============================================
  STUDENT_PROFILE: `${BASE_URL}/api/student-profile`,
  STUDENT_PROFILE_BY_ID: (id: string) => `${BASE_URL}/api/student-profile/${id}`,

  // ============================================
  // Admin Allocation Routes
  // ============================================
  ADMIN_ALLOCATIONS: `${BASE_URL}/api/admin/allocation`,
  ADMIN_ALLOCATION_BULK: `${BASE_URL}/api/admin/allocation/bulk`,
  ADMIN_ALLOCATION_HISTORY: (studentId: string) => `${BASE_URL}/api/admin/allocation/student/${studentId}/history`,

  // ============================================
  // Admin Dashboard Routes
  // ============================================
  ADMIN_DASHBOARD_METRICS: `${BASE_URL}/api/admin/dashboard/metrics`,
  ADMIN_DASHBOARD_OCCUPANCY_TREND: `${BASE_URL}/api/admin/dashboard/occupancy-trend`,
  ADMIN_DASHBOARD_COMPLAINT_TREND: `${BASE_URL}/api/admin/dashboard/complaint-trend`,

  // ============================================
  // Admin Room Routes
  // ============================================
  ADMIN_ROOMS: `${BASE_URL}/api/admin/room`,
  ADMIN_ROOM_BULK: `${BASE_URL}/api/admin/room/bulk`,
  ADMIN_ROOM_OCCUPANCY: `${BASE_URL}/api/admin/room/occupancy`,

  // ============================================
  // Admin Student Routes
  // ============================================
  ADMIN_STUDENTS: `${BASE_URL}/api/admin/student`,
  ADMIN_STUDENT_BY_ID: (id: string) => `${BASE_URL}/api/admin/student/${id}`,

  // ============================================
  // Hostel Management Routes
  // ============================================
  HOSTEL_MAIN: `${BASE_URL}/api/admin/hostel`,
  HOSTEL_BUILDINGS: `${BASE_URL}/api/admin/hostel/buildings`,
  HOSTEL_FLOORS: `${BASE_URL}/api/admin/hostel/floors`,
  HOSTEL_ROOMS: `${BASE_URL}/api/admin/hostel/rooms`,
  HOSTEL_AMENITIES: `${BASE_URL}/api/admin/hostel/amenities`,
  HOSTEL_ANNOUNCEMENTS: `${BASE_URL}/api/admin/hostel/announcements`,
  HOSTEL_MAINTENANCE: `${BASE_URL}/api/admin/hostel/maintenance`,
  HOSTEL_PAYMENTS: `${BASE_URL}/api/admin/hostel/payments`,
  HOSTEL_VISITORS: `${BASE_URL}/api/admin/hostel/visitors`,

  // ============================================
  // Student Complaint Routes
  // ============================================
  STUDENT_COMPLAINTS_SUBMIT: (tenantId: string) => `${BASE_URL}/api/complaints/student/${tenantId}/submit`,
  STUDENT_COMPLAINTS_LIST: (tenantId: string) => `${BASE_URL}/api/complaints/student/${tenantId}/my-complaints`,
  STUDENT_COMPLAINT_DETAIL: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/student/${tenantId}/${complaintId}`,
  STUDENT_COMPLAINT_COMMENTS: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/student/${tenantId}/${complaintId}/comments`,
  STUDENT_COMPLAINT_ADD_COMMENT: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/student/${tenantId}/${complaintId}/comments`,

  // ============================================
  // Admin Complaint Resolution Routes
  // ============================================
  ADMIN_COMPLAINTS_LIST: (tenantId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/all`,
  ADMIN_COMPLAINT_DETAIL: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/${complaintId}`,
  ADMIN_COMPLAINT_UPDATE_STATUS: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/${complaintId}/status`,
  ADMIN_COMPLAINT_RESOLVE: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/${complaintId}/resolve`,
  ADMIN_COMPLAINT_COMMENTS: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/${complaintId}/comments`,
  ADMIN_COMPLAINT_ADD_COMMENT: (tenantId: string, complaintId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/${complaintId}/comments`,
  ADMIN_COMPLAINT_STATS: (tenantId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/stats`,
  ADMIN_COMPLAINT_BY_CATEGORY: (tenantId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/by-category`,
  ADMIN_COMPLAINT_REPORT: (tenantId: string) => `${BASE_URL}/api/complaints/admin/${tenantId}/report`,

  // ============================================
  // Hostel Payment Routes (Admin)
  // ============================================
  HOSTEL_PAYMENT_INITIATE_RAZORPAY: `${BASE_URL}/api/admin/hostel/payments/razorpay/initiate`,
  HOSTEL_PAYMENT_VERIFY_RAZORPAY: `${BASE_URL}/api/admin/hostel/payments/razorpay/verify`,

  // ============================================
  // Student Payment Routes
  // ============================================
  STUDENT_PAYMENT_DUES: `${BASE_URL}/api/student/payments/dues`,
  STUDENT_PAYMENT_HISTORY: `${BASE_URL}/api/student/payments/history`,
  STUDENT_PAYMENT_INITIATE_RAZORPAY: `${BASE_URL}/api/student/payments/initiate`,
  STUDENT_PAYMENT_VERIFY_RAZORPAY: `${BASE_URL}/api/student/payments/verify`,

  // ============================================
  // Admin Payment Fee Settings Routes (✅ NEW ENDPOINTS)
  // ============================================
  ADMIN_PAYMENT_FEE_SETTINGS_GET: `${BASE_URL}/api/admin/payments/fee-settings`,
  ADMIN_PAYMENT_FEE_SETTINGS_CREATE: `${BASE_URL}/api/admin/payments/fee-settings`,
  ADMIN_PAYMENT_FEE_SETTINGS_UPDATE: `${BASE_URL}/api/admin/payments/fee-settings`,

  // ============================================
  // Admin Payment Dashboard Routes (existing)
  // ============================================
  ADMIN_PAYMENT_STATS: `${BASE_URL}/api/admin/payments/stats`,
  ADMIN_PAYMENT_DASHBOARD: `${BASE_URL}/api/admin/payments/dashboard-data`,
  ADMIN_PAYMENT_HISTORY: `${BASE_URL}/api/admin/payments/history`,
  ADMIN_PAYMENT_DUES: `${BASE_URL}/api/admin/payments/dues`,
  ADMIN_PAYMENT_SEND_REMINDERS: `${BASE_URL}/api/admin/payments/send-reminders`,
  ADMIN_PAYMENT_REPORTS: `${BASE_URL}/api/admin/payments/reports`,
  ADMIN_PAYMENT_SETTINGS: `${BASE_URL}/api/admin/payments/settings`,
  ADMIN_PAYMENT_SETTINGS_GET: `${BASE_URL}/api/admin/payments/settings`,
  ADMIN_PAYMENT_SETTINGS_UPDATE: `${BASE_URL}/api/admin/payments/settings`,

  // ============================================
  // Event Routes (Admin & Student) - NEW
  // ============================================
  ADMIN_EVENTS_LIST: `${BASE_URL}/api/admin/events`,
  ADMIN_EVENTS_CREATE: `${BASE_URL}/api/admin/events`,
  ADMIN_EVENTS_DETAIL: (id: string) => `${BASE_URL}/api/admin/events/${id}`,
  ADMIN_EVENTS_UPDATE: (id: string) => `${BASE_URL}/api/admin/events/${id}`,
  ADMIN_EVENTS_DELETE: (id: string) => `${BASE_URL}/api/admin/events/${id}`,
  STUDENT_EVENTS_PUBLISHED: `${BASE_URL}/api/admin/events/student/published`,
};

export default api;