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
        roomNumber,
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
          roomNumber,
          roomName: roomName || `Room ${roomNumber}`,
          roomType,
          capacity,
          description,
          imageUrl,
          hasAttachedBathroom: hasAttachedBathroom || false,
          hasBalcony: hasBalcony || false,
          hasACFacility: hasACFacility || false,
          hasHotWater: hasHotWater || false,
          hasFurniture: hasFurniture !== false, // default true
          hasWifi: hasWifi || false,
          hasTV: hasTV || false,
          hasRefrigerator: hasRefrigerator || false,
          floorArea: floorArea || null,
          status: "AVAILABLE",
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

      return room;
    });

    sendResponse(res, 201, "Room created successfully", result);
  } catch (error) {
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

    sendResponse(res, 200, "Rooms fetched successfully", {
      floorId,
      floorName: floor.floorName,
      totalRooms: rooms.length,
      rooms,
    });
  } catch (error) {
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

    sendResponse(res, 200, "Room fetched successfully", room);
  } catch (error) {
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
    } = req.query;

    const where: any = { tenantId };
    if (floorId) where.floorId = floorId;
    if (buildingId) where.buildingId = buildingId;
    if (roomType) where.roomType = roomType;
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      skip: parseInt(skip as string),
      take: parseInt(take as string),
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
    });

    const total = await prisma.room.count({ where });

    sendResponse(res, 200, "Rooms fetched successfully", {
      rooms,
      total,
      page: Math.ceil(parseInt(skip as string) / parseInt(take as string)) + 1,
    });
  } catch (error) {
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

    const updateData = req.body;

    const room = await prisma.room.updateMany({
      where: {
        id: roomId,
        tenantId,
      },
      data: updateData,
    });

    if (room.count === 0) {
      return sendResponse(res, 404, "Room not found");
    }

    const updatedRoom = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    sendResponse(res, 200, "Room updated successfully", updatedRoom);
  } catch (error) {
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
    });

    sendResponse(res, 200, "Room deleted successfully");
  } catch (error) {
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
        "Missing required fields"
      );
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

      for (let i = parseInt(startRoomNumber); i <= parseInt(endRoomNumber); i++) {
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
            capacity,
            description,
            status: "AVAILABLE",
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

      return { createdRooms, errors };
    });

    sendResponse(res, 201, "Rooms created successfully", result);
  } catch (error) {
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

    const stats = {
      roomNumber: room.roomNumber,
      roomName: room.roomName,
      roomType: room.roomType,
      capacity: room.capacity,
      occupied: room.occupied,
      available: room.capacity - room.occupied,
      occupancyRate: room.capacity > 0 
        ? ((room.occupied / room.capacity) * 100).toFixed(2)
        : "0",
      totalAmenities: room.amenities.length,
      activeComplaints: room.complaints.length,
      status: room.status,
    };

    sendResponse(res, 200, "Room stats fetched successfully", stats);
  } catch (error) {
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
            floorNumber: true,
            floorName: true,
          },
        },
        building: {
          select: {
            buildingName: true,
          },
        },
      },
    });

    // Calculate aggregate occupancy
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + room.occupied, 0);
    const totalAvailable = totalCapacity - totalOccupied;

    // Group by room type
    type RoomType = typeof rooms[number]['roomType'];
    const occupancyByType: Record<string, {
      type: RoomType;
      totalRooms: number;
      capacity: number;
      occupied: number;
      available: number;
    }> = {};
    rooms.forEach((room) => {
      if (!occupancyByType[room.roomType]) {
        occupancyByType[room.roomType] = {
          type: room.roomType,
          totalRooms: 0,
          capacity: 0,
          occupied: 0,
          available: 0,
        };
      }
      occupancyByType[room.roomType]!.totalRooms += 1;
      occupancyByType[room.roomType]!.capacity += room.capacity;
      occupancyByType[room.roomType]!.occupied += room.occupied;
      occupancyByType[room.roomType]!.available += room.capacity - room.occupied;
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
          };
        }
        occupancyByFloor[key].totalRooms += 1;
        occupancyByFloor[key].capacity += room.capacity;
        occupancyByFloor[key].occupied += room.occupied;
        occupancyByFloor[key].available += room.capacity - room.occupied;
      });
    }

    const occupancyStats = {
      summary: {
        totalRooms: rooms.length,
        totalCapacity,
        totalOccupied,
        totalAvailable,
        occupancyRate: totalCapacity > 0 
          ? ((totalOccupied / totalCapacity) * 100).toFixed(2)
          : "0",
      },
      byType: Object.values(occupancyByType),
      byFloor: floorId ? null : Object.values(occupancyByFloor),
    };

    sendResponse(res, 200, "Room occupancy fetched successfully", occupancyStats);
  } catch (error) {
    errorHandler(res, error);
  }
};