export interface CreateStudentProfileDTO {
  emergencyContactPhone: any;
  guardianName: string;
  guardianPhone: string;
  address: string;
  emergencyContact: string;
  dateOfBirth: string;
  bloodGroup?: string;
  enrollmentNumber?: string;
  course?: string;
  year?: string;
}

export interface UpdateStudentProfileDTO {
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  enrollmentNumber?: string;
  course?: string;
  year?: string;
}

export interface StudentProfileResponse {
  id: string;
  userId: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  emergencyContact: string;
  dateOfBirth: string;
  bloodGroup?: string;
  enrollmentNumber?: string;
  course?: string;
  year?: string;
  createdAt: string;
  updatedAt: string;
}