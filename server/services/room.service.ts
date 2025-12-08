import prisma from "../utils/prisma.ts";
import type { CreateRoomDTO, UpdateRoomDTO, BulkRoomCreateDTO } from "../types/room.type.ts";

export class RoomService {
  /**
   * Create a single room with validation
   */
  static async createRoom(tenantId: string, buildingId: string, data: CreateRoomDTO) {
    // Validate required fields
    if (!data.roomNumber || !data.roomType || !data.capacity) {
      throw new Error("Missing required fields: roomNumber, roomType, capacity");
    }

    // Validate capacity is positive
    if (data.capacity <= 0) {
      throw new Error("Room capacity must be greater than 0");
    }

    // Verify building exists and belongs to tenant
    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        tenantId,
      },
    });

    if (!building) {
      throw new Error("Building not found");
    }

    // ✅ FIXED: Changed data.floor to data.floorId
    const floorId = data.floor || (data as any).floor; // Support both floorId and floor

    if (!floorId) {
      throw new Error("Floor ID is required");
    }

    // Verify floor exists and belongs to building
    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        buildingId,
        tenantId,
      },
    });

    if (!floor) {
      throw new Error("Floor not found in this building");
    }

    // Check if room number already exists in this floor
    const existingRoom = await prisma.room.findFirst({
      where: {
        floorId,
        roomNumber: data.roomNumber.toString(),
      },
    });

    if (existingRoom) {
      throw new Error(`Room number ${data.roomNumber} already exists on this floor`);
    }

    // Create room with transaction
    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          tenantId,
          buildingId,
          floorId,
          roomNumber: data.roomNumber.toString(),
          roomName: data.roomName || `Room ${data.roomNumber}`,
          roomType: data.roomType as any, // Cast to RoomType enum
          capacity: parseInt(data.capacity.toString()),
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          hasAttachedBathroom: data.hasAttachedBathroom || false,
          hasBalcony: data.hasBalcony || false,
          hasACFacility: data.hasACFacility || false,
          hasHotWater: data.hasHotWater || false,
          hasFurniture: data.hasFurniture !== false,
          hasWifi: data.hasWifi || false,
          hasTV: data.hasTV || false,
          hasRefrigerator: data.hasRefrigerator || false,
          floorArea: data.floorArea ? parseFloat(data.floorArea.toString()) : null,
          status: "AVAILABLE",
          occupied: 0,
        },
        include: {
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      // Update floor room count
      const totalRoomsInFloor = await tx.room.count({
        where: { floorId },
      });

      await tx.floor.update({
        where: { id: floorId },
        data: { totalRooms: totalRoomsInFloor },
      });

      // Update building room count
      const totalRoomsInBuilding = await tx.room.count({
        where: { buildingId },
      });

      await tx.building.update({
        where: { id: buildingId },
        data: { totalRooms: totalRoomsInBuilding },
      });

      return newRoom;
    });

    console.log(`✅ Room created successfully: ${room.id}`);
    return room;
  }

  /**
   * Get room by ID with full details
   */
  static async getRoomById(tenantId: string, roomId: string) {
    if (!roomId) {
      throw new Error("Room ID is required");
    }

    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        floor: {
          select: {
            id: true,
            floorNumber: true,
            floorName: true,
          },
        },
        building: {
          select: {
            id: true,
            buildingName: true,
            buildingCode: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                amenityName: true,
                description: true,
                icon: true,
              },
            },
          },
        },
        roomAllocations: {
          where: { status: "ACTIVE" },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        feeStructure: true,
        complaints: {
          where: {
            status: {
              notIn: ["RESOLVED", "CLOSED"],
            },
          },
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
          },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    console.log(`✅ Room retrieved: ${roomId}`);
    return room;
  }

  /**
   * Get all rooms with filters and pagination
   */
  static async getAllRooms(
    tenantId: string,
    filters?: {
      floorId?: string;
      buildingId?: string;
      floorNumber?: number;
      roomType?: string;
      status?: string;
      search?: string;
    },
    pagination?: { skip: number; take: number }
  ) {
    const where: any = { tenantId };

    // Apply filters
    if (filters?.floorId) where.floorId = filters.floorId;
    if (filters?.buildingId) where.buildingId = filters.buildingId;
    if (filters?.roomType) where.roomType = filters.roomType;
    if (filters?.status) where.status = filters.status;

    // Search filter for room number or name
    if (filters?.search) {
      where.OR = [
        { roomNumber: { contains: filters.search, mode: "insensitive" } },
        { roomName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const skipNum = pagination?.skip ?? 0;
    const takeNum = pagination?.take ?? 10;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: { roomNumber: "asc" },
        include: {
          floor: {
            select: {
              floorNumber: true,
              floorName: true,
            },
          },
          building: {
            select: {
              buildingName: true,
              buildingCode: true,
            },
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          roomAllocations: {
            where: { status: "ACTIVE" },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    console.log(`✅ Retrieved ${rooms.length} rooms from total ${total}`);

    return {
      rooms,
      total,
      page: Math.floor(skipNum / takeNum) + 1,
      totalPages: Math.ceil(total / takeNum),
    };
  }

  /**
   * Get rooms by floor with all details
   */
  static async getRoomsByFloor(tenantId: string, floorId: string) {
    if (!floorId) {
      throw new Error("Floor ID is required");
    }

    // Verify floor exists and belongs to tenant
    const floor = await prisma.floor.findFirst({
      where: { id: floorId, tenantId },
    });

    if (!floor) {
      throw new Error("Floor not found");
    }

    const rooms = await prisma.room.findMany({
      where: { floorId, tenantId },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
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
      orderBy: { roomNumber: "asc" },
    });

    console.log(`✅ Retrieved ${rooms.length} rooms for floor: ${floorId}`);

    return {
      floorId,
      floorName: floor.floorName,
      floorNumber: floor.floorNumber,
      totalRooms: rooms.length,
      rooms,
    };
  }

  /**
   * Update room details
   */
  static async updateRoom(
    tenantId: string,
    roomId: string,
    data: UpdateRoomDTO
  ) {
    if (!roomId) {
      throw new Error("Room ID is required");
    }

    // Verify room belongs to tenant
    const existingRoom = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!existingRoom) {
      throw new Error("Room not found");
    }

    // Validate capacity if being updated
    if (data.capacity !== undefined) {
      if (data.capacity <= 0) {
        throw new Error("Room capacity must be greater than 0");
      }

      // Check if new capacity is less than current occupancy
      if (data.capacity < existingRoom.occupied) {
        throw new Error(
          `Cannot reduce capacity to ${data.capacity}. Current occupancy is ${existingRoom.occupied}`
        );
      }
    }

    const updateData: any = {};

    // Only update fields that are provided
    if (data.roomNumber !== undefined) {
      // Check if new room number already exists on same floor
      const existingWithNumber = await prisma.room.findFirst({
        where: {
          floorId: existingRoom.floorId,
          roomNumber: data.roomNumber.toString(),
          id: { not: roomId },
        },
      });

      if (existingWithNumber) {
        throw new Error(`Room number ${data.roomNumber} already exists on this floor`);
      }

      updateData.roomNumber = data.roomNumber.toString();
    }

    if (data.roomName !== undefined) updateData.roomName = data.roomName;
    if (data.capacity !== undefined) updateData.capacity = parseInt(data.capacity.toString());
    if (data.roomType !== undefined) updateData.roomType = data.roomType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.hasAttachedBathroom !== undefined) updateData.hasAttachedBathroom = data.hasAttachedBathroom;
    if (data.hasBalcony !== undefined) updateData.hasBalcony = data.hasBalcony;
    if (data.hasACFacility !== undefined) updateData.hasACFacility = data.hasACFacility;
    if (data.hasHotWater !== undefined) updateData.hasHotWater = data.hasHotWater;
    if (data.hasFurniture !== undefined) updateData.hasFurniture = data.hasFurniture;
    if (data.hasWifi !== undefined) updateData.hasWifi = data.hasWifi;
    if (data.hasTV !== undefined) updateData.hasTV = data.hasTV;
    if (data.hasRefrigerator !== undefined) updateData.hasRefrigerator = data.hasRefrigerator;
    
    // ✅ FIXED: Improved floor area handling
    if (data.floorArea !== undefined) {
      if (data.floorArea === null) {
        updateData.floorArea = null;
      } else {
        const floorAreaValue = typeof data.floorArea === "number" 
          ? data.floorArea 
          : parseFloat(String(data.floorArea));
        updateData.floorArea = isNaN(floorAreaValue) ? null : floorAreaValue;
      }
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: updateData,
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        roomAllocations: {
          where: { status: "ACTIVE" },
        },
      },
    });

    console.log(`✅ Room updated: ${roomId}`);
    return updated;
  }

  /**
   * Delete room with validation
   */
  static async deleteRoom(tenantId: string, roomId: string) {
    if (!roomId) {
      throw new Error("Room ID is required");
    }

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
        `Cannot delete room. ${activeAllocations} student(s) are currently allocated. Please deallocate them first.`
      );
    }

    // Delete with transaction to update counts
    await prisma.$transaction(async (tx) => {
      await tx.room.delete({ where: { id: roomId } });

      // Update floor room count
      const totalRoomsInFloor = await tx.room.count({
        where: { floorId: room.floorId },
      });

      await tx.floor.update({
        where: { id: room.floorId },
        data: { totalRooms: totalRoomsInFloor },
      });

      // Update building room count
      const totalRoomsInBuilding = await tx.room.count({
        where: { buildingId: room.buildingId },
      });

      await tx.building.update({
        where: { id: room.buildingId },
        data: { totalRooms: totalRoomsInBuilding },
      });
    });

    console.log(`✅ Room deleted: ${roomId}`);
    return { message: "Room deleted successfully" };
  }

  /**
   * Bulk create rooms for a floor
   */
  static async bulkCreateRooms(
    tenantId: string,
    buildingId: string,
    data: BulkRoomCreateDTO
  ) {
    // Validate required fields
    if (!data.floorId || !data.startRoomNumber || !data.endRoomNumber || !data.roomType || !data.capacity) {
      throw new Error("Missing required fields: floorId, startRoomNumber, endRoomNumber, roomType, capacity");
    }

    // Validate capacity
    if (data.capacity <= 0) {
      throw new Error("Room capacity must be greater than 0");
    }

    // Validate room number range
    const start = parseInt(data.startRoomNumber.toString());
    const end = parseInt(data.endRoomNumber.toString());

    if (isNaN(start) || isNaN(end) || start > end) {
      throw new Error("Invalid room number range");
    }

    // Verify floor exists and belongs to building and tenant
    const floor = await prisma.floor.findFirst({
      where: {
        id: data.floorId,
        buildingId,
        tenantId,
      },
    });

    if (!floor) {
      throw new Error("Floor not found in this building");
    }

    // Bulk create rooms
    const result = await prisma.$transaction(async (tx) => {
      const createdRooms = [];
      const errors = [];

      for (let i = start; i <= end; i++) {
        const roomNumber = i.toString();

        try {
          // Check if room already exists
          const existingRoom = await tx.room.findFirst({
            where: {
              floorId: data.floorId,
              roomNumber,
            },
          });

          if (existingRoom) {
            errors.push(`Room ${roomNumber} already exists`);
            continue;
          }

          const room = await tx.room.create({
            data: {
              tenantId,
              buildingId,
              floorId: data.floorId,
              roomNumber,
              roomName: `Room ${roomNumber}`,
              roomType: data.roomType as any, // Cast to RoomType enum
              capacity: parseInt(data.capacity.toString()),
              description: data.description || null,
              status: "AVAILABLE",
              occupied: 0,
            },
          });

          createdRooms.push(room);
        } catch (error: any) {
          errors.push(`Error creating room ${roomNumber}: ${error.message}`);
        }
      }

      // Update floor room count
      const totalRoomsInFloor = await tx.room.count({
        where: { floorId: data.floorId },
      });

      await tx.floor.update({
        where: { id: data.floorId },
        data: { totalRooms: totalRoomsInFloor },
      });

      // Update building room count
      const totalRoomsInBuilding = await tx.room.count({
        where: { buildingId },
      });

      await tx.building.update({
        where: { id: buildingId },
        data: { totalRooms: totalRoomsInBuilding },
      });

      console.log(`✅ Bulk created ${createdRooms.length} rooms. Errors: ${errors.length}`);

      return {
        createdRooms,
        errors,
        createdCount: createdRooms.length,
        errorCount: errors.length,
      };
    });

    return result;
  }

  /**
   * Get room statistics
   */
  static async getRoomStats(tenantId: string, roomId: string) {
    if (!roomId) {
      throw new Error("Room ID is required");
    }

    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        roomAllocations: {
          where: { status: "ACTIVE" },
        },
        amenities: true,
        complaints: {
          where: {
            status: {
              notIn: ["RESOLVED", "CLOSED"],
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    const occupancyRate = room.capacity > 0
      ? ((room.occupied / room.capacity) * 100).toFixed(2)
      : "0";

    const stats = {
      roomNumber: room.roomNumber,
      roomName: room.roomName,
      roomType: room.roomType,
      capacity: room.capacity,
      occupied: room.occupied,
      available: room.capacity - room.occupied,
      occupancyRate: parseFloat(occupancyRate),
      occupancyPercentage: `${occupancyRate}%`,
      totalAmenities: room.amenities.length,
      activeComplaints: room.complaints.length,
      status: room.status,
      isFull: room.occupied >= room.capacity,
      hasAvailability: room.occupied < room.capacity,
    };

    console.log(`✅ Room stats retrieved: ${roomId}`);
    return stats;
  }

  /**
   * Get aggregate room occupancy statistics
   */
  static async getRoomOccupancy(
    tenantId: string,
    filters?: {
      buildingId?: string;
      floorId?: string;
      roomType?: string;
    }
  ) {
    const where: any = { tenantId };
    if (filters?.buildingId) where.buildingId = filters.buildingId;
    if (filters?.floorId) where.floorId = filters.floorId;
    if (filters?.roomType) where.roomType = filters.roomType;

    // Get all rooms with occupancy data
    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomAllocations: {
          where: { status: "ACTIVE" },
        },
        floor: {
          select: {
            id: true,
            floorNumber: true,
            floorName: true,
          },
        },
        building: {
          select: {
            id: true,
            buildingName: true,
            buildingCode: true,
          },
        },
      },
    });

    // Calculate summary stats
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + room.occupied, 0);
    const totalAvailable = totalCapacity - totalOccupied;
    const occupancyRate = totalCapacity > 0
      ? ((totalOccupied / totalCapacity) * 100).toFixed(2)
      : "0";

    // Group by room type
    type RoomType = typeof rooms[number]['roomType'];
    const occupancyByType: Record<string, {
      type: RoomType;
      totalRooms: number;
      capacity: number;
      occupied: number;
      available: number;
      occupancyRate: string;
    }> = {};

    rooms.forEach((room) => {
      if (!occupancyByType[room.roomType]) {
        occupancyByType[room.roomType] = {
          type: room.roomType,
          totalRooms: 0,
          capacity: 0,
          occupied: 0,
          available: 0,
          occupancyRate: "0",
        };
      }
      occupancyByType[room.roomType]!.totalRooms += 1;
      occupancyByType[room.roomType]!.capacity += room.capacity;
      occupancyByType[room.roomType]!.occupied += room.occupied;
      occupancyByType[room.roomType]!.available += room.capacity - room.occupied;
    });

    // Calculate occupancy rate for each type
    Object.keys(occupancyByType).forEach((type) => {
      const typeData = occupancyByType[type]!;
      typeData.occupancyRate = typeData.capacity > 0
        ? ((typeData.occupied / typeData.capacity) * 100).toFixed(2)
        : "0";
    });

    // ✅ FIXED: Group by floor (if not filtered by floor)
    const occupancyByFloor: {
      [key: string]: {
        floorId: string;
        floorNumber: number;
        floorName: string;
        totalRooms: number;
        capacity: number;
        occupied: number;
        available: number;
        occupancyRate: string;
      };
    } = {};

    if (!filters?.floorId) {
      rooms.forEach((room) => {
        const key = room.floorId;
        if (!occupancyByFloor[key]) {
          occupancyByFloor[key] = {
            floorId: room.floorId,
            floorNumber: room.floor.floorNumber,
            floorName: room.floor.floorName,
            totalRooms: 0,
            capacity: 0,
            occupied: 0,
            available: 0,
            occupancyRate: "0",
          };
        }
        occupancyByFloor[key]!.totalRooms += 1;
        occupancyByFloor[key]!.capacity += room.capacity;
        occupancyByFloor[key]!.occupied += room.occupied;
        occupancyByFloor[key]!.available += room.capacity - room.occupied;
      });

      // Calculate occupancy rate for each floor
      Object.keys(occupancyByFloor).forEach((floorKey) => {
        const floorData = occupancyByFloor[floorKey];
        if (floorData) {
          floorData.occupancyRate = floorData.capacity > 0
            ? ((floorData.occupied / floorData.capacity) * 100).toFixed(2)
            : "0";
        }
      });
    }

    const occupancyStats = {
      summary: {
        totalRooms: rooms.length,
        totalCapacity,
        totalOccupied,
        totalAvailable,
        occupancyRate: parseFloat(occupancyRate),
        occupancyPercentage: `${occupancyRate}%`,
        fullRooms: rooms.filter((r) => r.occupied >= r.capacity).length,
        availableRooms: rooms.filter((r) => r.occupied < r.capacity).length,
        emptyRooms: rooms.filter((r) => r.occupied === 0).length,
      },
      byType: Object.values(occupancyByType),
      byFloor: filters?.floorId ? null : Object.values(occupancyByFloor),
    };

    console.log(`✅ Room occupancy stats retrieved`);
    return occupancyStats;
  }

  /**
   * Check room allocation conflicts and capacity
   */
  static async checkAllocationConflicts(
    tenantId: string,
    roomId: string,
    studentId: string
  ) {
    // Verify room exists
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        roomAllocations: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Check if student already has active allocation
    const studentAllocation = await prisma.roomAllocation.findFirst({
      where: { studentId, status: "ACTIVE" },
    });

    if (studentAllocation) {
      throw new Error("Student already has an active room allocation");
    }

    // ✅ CHECK ROOM CAPACITY
    if (room.roomAllocations.length >= room.capacity) {
      throw new Error(
        `Room is full. Current occupancy: ${room.roomAllocations.length}/${room.capacity}`
      );
    }

    // Check room status
    if (room.status === "MAINTENANCE" || room.status === "INACTIVE") {
      throw new Error(`Room is ${room.status} and cannot be allocated`);
    }

    console.log(`✅ Allocation conflicts checked for room: ${roomId}`);
    return true;
  }
}