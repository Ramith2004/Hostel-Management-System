import type { Request, Response } from "express";
import prisma from "../../../utils/prisma.ts";
import { errorHandler } from "../../../utils/error-handler.ts";
import { sendResponse } from "../../../utils/response-handler.ts";
import type { AuthUser } from "../../../types/auth-user.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Create Room with Floor Validation
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const {
      buildingId,
      floorId,
      roomNumber,
      roomName,
      roomType,
      capacity,
      description,
      imageUrl,
      hasAttachedBathroom,
      hasBalcony,
      hasACFacility,
      hasHotWater,
      hasFurniture,
      hasWifi,
      hasTV,
      hasRefrigerator,
      floorArea,
    } = req.body;

    // Validate required fields
    if (!buildingId || !floorId || !roomNumber || !roomType || !capacity) {
      return sendResponse(
        res,
        400,
        "Missing required fields: buildingId, floorId, roomNumber, roomType, capacity"
      );
    }

    // Validate capacity is positive
    if (capacity <= 0) {
      return sendResponse(res, 400, "Room capacity must be greater than 0");
    }

    // Validate room number
    if (!roomNumber || roomNumber.toString().trim() === "") {
      return sendResponse(res, 400, "Room number cannot be empty");
    }

    // Verify floor exists and belongs to the building and tenant
    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        buildingId,
        tenantId,
      },
      include: {
        building: true,
      },
    });

    if (!floor) {
      return sendResponse(
        res,
        404,
        "Floor not found or does not belong to the specified building"
      );
    }

    // Check if room number already exists in this floor
    const existingRoom = await prisma.room.findFirst({
      where: {
        floorId,
        roomNumber: roomNumber.toString(),
      },
    });

    if (existingRoom) {
      return sendResponse(
        res,
        400,
        `Room number ${roomNumber} already exists on this floor`
      );
    }

    // Use transaction to create room and update floor counts
    const result = await prisma.$transaction(async (tx) => {
      // Create the room
      const room = await tx.room.create({
        data: {
          tenantId,
          buildingId,
          floorId,
          roomNumber: roomNumber.toString(),
          roomName: roomName || `Room ${roomNumber}`,
          roomType,
          capacity: parseInt(capacity),
          description: description || null,
          imageUrl: imageUrl || null,
          hasAttachedBathroom: hasAttachedBathroom || false,
          hasBalcony: hasBalcony || false,
          hasACFacility: hasACFacility || false,
          hasHotWater: hasHotWater || false,
          hasFurniture: hasFurniture !== false, // default true
          hasWifi: hasWifi || false,
          hasTV: hasTV || false,
          hasRefrigerator: hasRefrigerator || false,
          floorArea: floorArea ? parseFloat(floorArea) : null,
          status: "AVAILABLE",
          occupied: 0, // Initialize occupied count
        },
        include: {
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      // Count total rooms in floor
      const totalRoomsInFloor = await tx.room.count({
        where: { floorId },
      });

      // Update floor's totalRooms count
      await tx.floor.update({
        where: { id: floorId },
        data: { totalRooms: totalRoomsInFloor },
      });

      // Update building's totalRooms count
      const totalRoomsInBuilding = await tx.room.count({
        where: { buildingId },
      });

      await tx.building.update({
        where: { id: buildingId },
        data: { totalRooms: totalRoomsInBuilding },
      });

      console.log("✅ Room created successfully:", room.id);

      return room;
    });

    sendResponse(res, 201, "Room created successfully", result);
  } catch (error) {
    console.error("❌ Error creating room:", error);
    errorHandler(res, error);
  }
};

// Get All Rooms in a Floor
export const getRoomsByFloor = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!floorId) {
      return sendResponse(res, 400, "Floor ID is required");
    }

    // Verify floor exists
    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        tenantId,
      },
    });

    if (!floor) {
      return sendResponse(res, 404, "Floor not found");
    }

    const rooms = await prisma.room.findMany({
      where: {
        floorId,
        tenantId,
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        roomAllocations: {
          where: {
            status: "ACTIVE",
          },
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

    sendResponse(res, 200, "Rooms fetched successfully", {
      floorId,
      floorName: floor.floorName,
      totalRooms: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("❌ Error fetching rooms by floor:", error);
    errorHandler(res, error);
  }
};

// Get Room By ID with Amenities
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!roomId) {
      return sendResponse(res, 400, "Room ID is required");
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        tenantId,
      },
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
          where: {
            status: "ACTIVE",
          },
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
      return sendResponse(res, 404, "Room not found");
    }

    console.log(`✅ Retrieved room details: ${roomId}`);

    sendResponse(res, 200, "Room fetched successfully", room);
  } catch (error) {
    console.error("❌ Error fetching room by ID:", error);
    errorHandler(res, error);
  }
};

// Get All Rooms (with filters)
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const {
      skip = 0,
      take = 10,
      floorId,
      buildingId,
      roomType,
      status,
      search,
    } = req.query;

    const where: any = { tenantId };
    if (floorId) where.floorId = floorId;
    if (buildingId) where.buildingId = buildingId;
    if (roomType) where.roomType = roomType;
    if (status) where.status = status;
    
    // Add search filter for room number or name
    if (search) {
      where.OR = [
        { roomNumber: { contains: search as string, mode: "insensitive" } },
        { roomName: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skipNum = parseInt(skip as string) || 0;
    const takeNum = parseInt(take as string) || 10;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip: skipNum,
        take: takeNum,
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
            },
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          roomAllocations: {
            where: {
              status: "ACTIVE",
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.room.count({ where }),
    ]);

    console.log(`✅ Retrieved ${rooms.length} rooms from total ${total}`);

    sendResponse(res, 200, "Rooms fetched successfully", {
      rooms,
      total,
      page: Math.floor(skipNum / takeNum) + 1,
      totalPages: Math.ceil(total / takeNum),
    });
  } catch (error) {
    console.error("❌ Error fetching all rooms:", error);
    errorHandler(res, error);
  }
};

// Update Room
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!roomId) {
      return sendResponse(res, 400, "Room ID is required");
    }

    // Verify room exists and belongs to tenant
    const existingRoom = await prisma.room.findFirst({
      where: {
        id: roomId,
        tenantId,
      },
    });

    if (!existingRoom) {
      return sendResponse(res, 404, "Room not found");
    }

    const updateData = req.body;

    // Validate capacity if being updated
    if (updateData.capacity && updateData.capacity <= 0) {
      return sendResponse(res, 400, "Room capacity must be greater than 0");
    }

    // If capacity is being decreased, check if it's less than current occupancy
    if (updateData.capacity && updateData.capacity < existingRoom.occupied) {
      return sendResponse(
        res,
        400,
        `Cannot reduce capacity to ${updateData.capacity}. Current occupancy is ${existingRoom.occupied}`
      );
    }

    // Convert capacity to integer if provided
    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: updateData,
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        roomAllocations: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    console.log(`✅ Room updated successfully: ${roomId}`);

    sendResponse(res, 200, "Room updated successfully", updatedRoom);
  } catch (error) {
    console.error("❌ Error updating room:", error);
    errorHandler(res, error);
  }
};

// Delete Room
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!roomId) {
      return sendResponse(res, 400, "Room ID is required");
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        tenantId,
      },
    });

    if (!room) {
      return sendResponse(res, 404, "Room not found");
    }

    // Check if room has active allocations
    const activeAllocations = await prisma.roomAllocation.count({
      where: {
        roomId,
        status: "ACTIVE",
      },
    });

    if (activeAllocations > 0) {
      return sendResponse(
        res,
        400,
        `Cannot delete room. ${activeAllocations} student(s) are currently allocated to this room`
      );
    }

    // Use transaction to delete room and update floor/building counts
    await prisma.$transaction(async (tx) => {
      // Delete room
      await tx.room.delete({
        where: { id: roomId },
      });

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

      console.log(`✅ Room deleted successfully: ${roomId}`);
    });

    sendResponse(res, 200, "Room deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    errorHandler(res, error);
  }
};

// Bulk Create Rooms for a Floor
export const bulkCreateRooms = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const {
      buildingId,
      floorId,
      startRoomNumber,
      endRoomNumber,
      roomType,
      capacity,
      description,
    } = req.body;

    if (!buildingId || !floorId || !startRoomNumber || !endRoomNumber || !roomType || !capacity) {
      return sendResponse(
        res,
        400,
        "Missing required fields: buildingId, floorId, startRoomNumber, endRoomNumber, roomType, capacity"
      );
    }

    // Validate capacity
    if (capacity <= 0) {
      return sendResponse(res, 400, "Room capacity must be greater than 0");
    }

    // Validate room numbers
    const start = parseInt(startRoomNumber);
    const end = parseInt(endRoomNumber);

    if (isNaN(start) || isNaN(end) || start > end) {
      return sendResponse(res, 400, "Invalid room number range");
    }

    // Verify floor exists
    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        buildingId,
        tenantId,
      },
    });

    if (!floor) {
      return sendResponse(res, 404, "Floor not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdRooms = [];
      const errors = [];

      for (let i = start; i <= end; i++) {
        const roomNumber = i.toString();

        // Check if room already exists
        const existingRoom = await tx.room.findFirst({
          where: {
            floorId,
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
            floorId,
            roomNumber,
            roomName: `Room ${roomNumber}`,
            roomType,
            capacity: parseInt(capacity.toString()),
            description: description || null,
            status: "AVAILABLE",
            occupied: 0,
          },
        });

        createdRooms.push(room);
      }

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

      console.log(`✅ Bulk created ${createdRooms.length} rooms. Errors: ${errors.length}`);

      return { createdRooms, errors, createdCount: createdRooms.length, errorCount: errors.length };
    });

    sendResponse(res, 201, "Rooms created successfully", result);
  } catch (error) {
    console.error("❌ Error bulk creating rooms:", error);
    errorHandler(res, error);
  }
};

// Get Room Statistics
export const getRoomStats = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!roomId) {
      return sendResponse(res, 400, "Room ID is required");
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        tenantId,
      },
      include: {
        roomAllocations: {
          where: {
            status: "ACTIVE",
          },
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
      return sendResponse(res, 404, "Room not found");
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

    console.log(`✅ Room stats retrieved for room: ${roomId}`);

    sendResponse(res, 200, "Room stats fetched successfully", stats);
  } catch (error) {
    console.error("❌ Error fetching room stats:", error);
    errorHandler(res, error);
  }
};

// Get Room Occupancy (Aggregate statistics)
export const getRoomOccupancy = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const { buildingId, floorId, roomType } = req.query;

    const where: any = { tenantId };
    if (buildingId) where.buildingId = buildingId;
    if (floorId) where.floorId = floorId;
    if (roomType) where.roomType = roomType;

    // Get all rooms with occupancy data
    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomAllocations: {
          where: {
            status: "ACTIVE",
          },
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
          },
        },
      },
    });

    // Calculate aggregate occupancy
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

    // Group by floor (if not filtered by floor)
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
    
    if (!floorId) {
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
        occupancyByFloor[key].totalRooms += 1;
        occupancyByFloor[key].capacity += room.capacity;
        occupancyByFloor[key].occupied += room.occupied;
        occupancyByFloor[key].available += room.capacity - room.occupied;
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
      byFloor: floorId ? null : Object.values(occupancyByFloor),
    };

    console.log(`✅ Room occupancy stats retrieved`);

    sendResponse(res, 200, "Room occupancy fetched successfully", occupancyStats);
  } catch (error) {
    console.error("❌ Error fetching room occupancy:", error);
    errorHandler(res, error);
  }
};