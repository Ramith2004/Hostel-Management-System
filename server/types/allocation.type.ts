import { AllocationStatus } from "@prisma/client";

export interface CreateAllocationDTO {
  studentId: string;
  roomId: string;
  remarks?: string;
}

export interface UpdateAllocationDTO {
  roomId?: string;
  status?: AllocationStatus;
  remarks?: string;
}

export interface AllocationDetailResponse {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  allocatedDate: string;
  checkoutDate?: string;
  status: AllocationStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationListResponse {
  id: string;
  studentName: string;
  roomNumber: string;
  floor: number;
  allocatedDate: string;
  status: AllocationStatus;
}

export interface BulkAllocationDTO {
  allocations: Array<{
    studentId: string;
    roomId: string;
  }>;
  remarks?: string;
}

export interface AllocationHistoryResponse {
  id: string;
  studentId: string;
  roomId: string;
  roomNumber: string;
  allocatedDate: string;
  checkoutDate?: string;
  status: AllocationStatus;
  durationDays?: number;
}