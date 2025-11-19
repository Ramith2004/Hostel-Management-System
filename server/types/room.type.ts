import { RoomType, RoomStatus } from "@prisma/client";

export interface CreateRoomDTO {
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
}

export interface UpdateRoomDTO {
  roomNumber?: string;
  floor?: number;
  capacity?: number;
  roomType?: RoomType;
  status?: RoomStatus;
}

export interface RoomDetailResponse {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: RoomType;
  status: RoomStatus;
  occupancyPercentage: number;
  allocations?: Array<{
    studentId: string;
    studentName: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface RoomListResponse {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: RoomType;
  status: RoomStatus;
}

export interface BulkRoomCreateDTO {
  floorNumber: number;
  startRoomNumber: number;
  endRoomNumber: number;
  capacity: number;
  roomType: string;
}