import api from './api';
import { API_ROUTES } from './api';

interface CreateStudentPayload {
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  course?: string;
  year?: string;
  enrollmentNumber?: string;
  roomId: string;
}

export const createStudentWithRoomAssignment = async (payload: CreateStudentPayload) => {
  try {
    const response = await api.post(API_ROUTES.ADMIN_STUDENTS, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to create student'
    );
  }
};
export const fetchAllStudents = async () => {
  try {
    const response = await api.get(API_ROUTES.ADMIN_STUDENTS);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch students');
  }
};

export const fetchStudentById = async (id: string) => {
  try {
    const response = await api.get(API_ROUTES.ADMIN_STUDENT_BY_ID(id));
    return response.data.data || null;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch student');
  }
};