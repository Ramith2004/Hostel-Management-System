import { RoomType, RoomStatus } from "@prisma/client";

export interface CreateRoomDTO {
  floorArea: number | string | null;
  hasRefrigerator: boolean;
  hasTV: boolean;
  hasWifi: boolean;
  hasFurniture: boolean;
  hasHotWater: boolean;
  hasBalcony: boolean;
  hasACFacility: boolean;
  hasAttachedBathroom: boolean;
  imageUrl: null;
  description: null;
  roomName: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
}

export interface UpdateRoomDTO {
  floorArea: undefined;
  hasRefrigerator: undefined;
  hasTV: undefined;
  hasWifi: undefined;
  hasFurniture: undefined;
  hasACFacility: undefined;
  hasHotWater: undefined;
  hasBalcony: undefined;
  hasAttachedBathroom: undefined;
  imageUrl: undefined;
  description: undefined;
  roomName: undefined;
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
  description: null;
  floorId: any;
  floorNumber: number;
  startRoomNumber: number;
  endRoomNumber: number;
  capacity: number;
  roomType: string;
}