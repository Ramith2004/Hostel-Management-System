import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define the base URL for all APIs
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ROUTES = {
  // Auth Routes
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  ONBOARD_ORG: `${BASE_URL}/api/auth/onboarding/organization`,
  ONBOARD_ADMIN_PROFILE: `${BASE_URL}/api/auth/onboarding/admin-profile`,
  ONBOARD_PAYMENT: `${BASE_URL}/api/auth/onboarding/payment`,
  ONBOARD_COMPLETE: `${BASE_URL}/api/auth/onboarding/complete`,

  // Student Profile Routes
  STUDENT_PROFILE: `${BASE_URL}/api/student-profile`,
  STUDENT_PROFILE_BY_ID: (id: string) => `${BASE_URL}/api/student-profile/${id}`,

  // Admin Allocation Routes
  ADMIN_ALLOCATIONS: `${BASE_URL}/api/admin/allocation`,
  ADMIN_ALLOCATION_BULK: `${BASE_URL}/api/admin/allocation/bulk`,
  ADMIN_ALLOCATION_HISTORY: (studentId: string) => `${BASE_URL}/api/admin/allocation/student/${studentId}/history`,

  // Admin Dashboard Routes
  ADMIN_DASHBOARD_METRICS: `${BASE_URL}/api/admin/dashboard/metrics`,
  ADMIN_DASHBOARD_OCCUPANCY_TREND: `${BASE_URL}/api/admin/dashboard/occupancy-trend`,
  ADMIN_DASHBOARD_COMPLAINT_TREND: `${BASE_URL}/api/admin/dashboard/complaint-trend`,

  // Admin Room Routes
  ADMIN_ROOMS: `${BASE_URL}/api/admin/room`,
  ADMIN_ROOM_BULK: `${BASE_URL}/api/admin/room/bulk`,
  ADMIN_ROOM_OCCUPANCY: `${BASE_URL}/api/admin/room/occupancy`,

  // Admin Student Routes
  ADMIN_STUDENTS: `${BASE_URL}/api/admin/student`,
  ADMIN_STUDENT_BY_ID: (id: string) => `${BASE_URL}/api/admin/student/${id}`,

  // Hostel Management Routes
  HOSTEL_MAIN: `${BASE_URL}/api/admin/hostel`,
  HOSTEL_BUILDINGS: `${BASE_URL}/api/admin/hostel/buildings`,
  HOSTEL_FLOORS: `${BASE_URL}/api/admin/hostel/floors`,
  HOSTEL_ROOMS: `${BASE_URL}/api/admin/hostel/rooms`,
  HOSTEL_AMENITIES: `${BASE_URL}/api/admin/hostel/amenities`,
  HOSTEL_ANNOUNCEMENTS: `${BASE_URL}/api/admin/hostel/announcements`,
  HOSTEL_MAINTENANCE: `${BASE_URL}/api/admin/hostel/maintenance`,
  HOSTEL_PAYMENTS: `${BASE_URL}/api/admin/hostel/payments`,
  HOSTEL_VISITORS: `${BASE_URL}/api/admin/hostel/visitors`,
  // Student Complaint Routes
  STUDENT_COMPLAINTS: `${BASE_URL}/api/student/complaint`,
  STUDENT_COMPLAINT_BY_ID: (id: string) => `${BASE_URL}/api/student/complaint/${id}`,
  ADMIN_COMPLAINTS: `${BASE_URL}/api/admin/hostel/complaint`,
};

export default api;