import prisma from "../utils/prisma.ts";
import type { CreateRoomDTO, UpdateRoomDTO, BulkRoomCreateDTO } from "../types/room.type.ts";

export class RoomService {
  static async createRoom(tenantId: string, buildingId: string, data: CreateRoomDTO) {
    // Check if room number already exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        tenantId,
        roomNumber: data.roomNumber,
      },
    });

    if (existingRoom) {
      throw new Error("Room number already exists");
    }

    // Get or create floor
    const floor = await prisma.floor.findFirst({
      where: {
        buildingId,
        floorNumber: data.floor,
      },
    });

    if (!floor) {
      throw new Error("Floor not found in this building");
    }

    const room = await prisma.room.create({
      data: {
        tenantId,
        buildingId,
        floorId: floor.id,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        capacity: data.capacity,
      },
    });

    return room;
  }

  static async getRoomById(tenantId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        floor: true,
        building: true,
        roomAllocations: {
          where: { status: "ACTIVE" },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    return room;
  }

  static async getAllRooms(
    tenantId: string,
    filters?: {
      floorNumber?: number;
      roomType?: string;
      status?: string;
    },
    pagination?: { skip: number; take: number }
  ) {
    const where: any = { tenantId };

    if (filters?.floorNumber) {
      where.floor = { floorNumber: filters.floorNumber };
    }
    if (filters?.roomType) where.roomType = filters.roomType;
    if (filters?.status) where.status = filters.status;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        ...(pagination?.skip !== undefined && { skip: pagination.skip }),
        ...(pagination?.take !== undefined && { take: pagination.take }),
        orderBy: { roomNumber: "asc" },
        include: { floor: true, building: true },
      }),
      prisma.room.count({ where }),
    ]);

    return { rooms, total };
  }

  static async updateRoom(
    tenantId: string,
    roomId: string,
    data: UpdateRoomDTO
  ) {
    // Verify room belongs to tenant
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    const updateData: any = {};
    if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.roomType !== undefined) updateData.roomType = data.roomType;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: updateData,
    });

    return updated;
  }

  static async deleteRoom(tenantId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Check if room has active allocations
    const activeAllocations = await prisma.roomAllocation.count({
      where: { roomId, status: "ACTIVE" },
    });

    if (activeAllocations > 0) {
      throw new Error(
        "Cannot delete room with active allocations. Please deallocate students first."
      );
    }

    await prisma.room.delete({ where: { id: roomId } });

    return { message: "Room deleted successfully" };
  }

  static async bulkCreateRooms(tenantId: string, buildingId: string, data: BulkRoomCreateDTO) {
    const rooms = [];

    // Get or create floor
    const floor = await prisma.floor.findFirst({
      where: {
        buildingId,
        floorNumber: data.floorNumber,
      },
    });

    if (!floor) {
      throw new Error("Floor not found in this building");
    }

    for (let i = data.startRoomNumber; i <= data.endRoomNumber; i++) {
      const roomNumber = `${data.floorNumber}-${String(i).padStart(2, "0")}`;

      const existingRoom = await prisma.room.findFirst({
        where: {
          tenantId,
          roomNumber,
        },
      });

      if (!existingRoom) {
        const room = await prisma.room.create({
          data: {
            tenantId,
            buildingId,
            floorId: floor.id,
            roomNumber,
            capacity: data.capacity,
            roomType: data.roomType as any,
          },
        });

        rooms.push(room);
      }
    }

    return { created: rooms.length, rooms };
  }

  static async getRoomOccupancy(tenantId: string) {
    const rooms = await prisma.room.findMany({
      where: { tenantId },
      select: {
        id: true,
        roomNumber: true,
        capacity: true,
        occupied: true,
      },
    });

    const occupancy = rooms.map((room) => ({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      occupied: room.occupied,
      available: room.capacity - room.occupied,
      occupancyPercentage: parseFloat(
        ((room.occupied / room.capacity) * 100).toFixed(2)
      ),
    }));

    return occupancy;
  }
}