import type { Request, Response } from "express";
import prisma from "../../../utils/prisma.ts";
import { errorHandler } from "../../../utils/error-handler.ts";
import { responseHandler } from "../../../utils/response-handler.ts";
import type { AuthUser } from "../../../types/auth-user.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Create Amenity (Tenant-wide)
export const createAmenity = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const { amenityName, description, icon } = req.body;

    if (!amenityName) {
      return responseHandler(res, 400, "Amenity name is required");
    }

    // Check if amenity already exists
    const existingAmenity = await prisma.roomAmenity.findFirst({
      where: {
        tenantId,
        amenityName,
      },
    });

    if (existingAmenity) {
      return responseHandler(res, 400, "Amenity already exists");
    }

    const amenity = await prisma.roomAmenity.create({
      data: {
        tenantId,
        amenityName,
        description,
        icon,
      },
    });

    responseHandler(res, 201, "Amenity created successfully", amenity);
  } catch (error) {
    errorHandler(res, error);
  }
};

// Get All Amenities
export const getAllAmenities = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;

    const amenities = await prisma.roomAmenity.findMany({
      where: { tenantId },
      include: {
        rooms: {
          select: {
            room: {
              select: {
                id: true,
                roomNumber: true,
                roomName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    responseHandler(res, 200, "Amenities fetched successfully", amenities);
  } catch (error) {
    errorHandler(res, error);
  }
};

// Get Amenity By ID
export const getAmenityById = async (req: Request, res: Response) => {
  try {
    const { amenityId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!amenityId) {
      return responseHandler(res, 400, "Amenity ID is required");
    }

    const amenity = await prisma.roomAmenity.findFirst({
      where: {
        id: amenityId,
        tenantId,
      },
      include: {
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                roomNumber: true,
                roomName: true,
                floorId: true,
                buildingId: true,
              },
            },
          },
        },
      },
    });

    if (!amenity) {
      return responseHandler(res, 404, "Amenity not found");
    }

    responseHandler(res, 200, "Amenity fetched successfully", amenity);
  } catch (error) {
    errorHandler(res, error);
  }
};

// Update Amenity
export const updateAmenity = async (req: Request, res: Response) => {
  try {
    const { amenityId } = req.params;
    const { tenantId } = req.user as AuthUser;
    const { amenityName, description, icon } = req.body;

    if (!amenityId) {
      return responseHandler(res, 400, "Amenity ID is required");
    }

    const amenity = await prisma.roomAmenity.updateMany({
      where: {
        id: amenityId,
        tenantId,
      },
      data: {
        amenityName,
        description,
        icon,
      },
    });

    if (amenity.count === 0) {
      return responseHandler(res, 404, "Amenity not found");
    }

    const updatedAmenity = await prisma.roomAmenity.findUnique({
      where: { id: amenityId },
    });

    responseHandler(res, 200, "Amenity updated successfully", updatedAmenity);
  } catch (error) {
    errorHandler(res, error);
  }
};

// Delete Amenity
export const deleteAmenity = async (req: Request, res: Response) => {
  try {
    const { amenityId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!amenityId) {
      return responseHandler(res, 400, "Amenity ID is required");
    }

    const amenity = await prisma.roomAmenity.findFirst({
      where: {
        id: amenityId,
        tenantId,
      },
    });

    if (!amenity) {
      return responseHandler(res, 404, "Amenity not found");
    }

    await prisma.roomAmenity.delete({
      where: { id: amenityId },
    });

    responseHandler(res, 200, "Amenity deleted successfully");
  } catch (error) {
    errorHandler(res, error);
  }
};

// Add Amenity to Room (with Room Validation)
export const addAmenityToRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, amenityId } = req.body;
    const { tenantId } = req.user as AuthUser;

    if (!roomId || !amenityId) {
      return responseHandler(res, 400, "Room ID and Amenity ID are required");
    }

    // Verify room belongs to tenant
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
      include: {
        floor: {
          select: {
            floorName: true,
            floorNumber: true,
          },
        },
        building: {
          select: {
            buildingName: true,
          },
        },
      },
    });

    if (!room) {
      return responseHandler(res, 404, "Room not found");
    }

    // Verify amenity belongs to tenant
    const amenity = await prisma.roomAmenity.findFirst({
      where: { id: amenityId, tenantId },
    });

    if (!amenity) {
      return responseHandler(res, 404, "Amenity not found");
    }

    // Check if amenity already added
    const existing = await prisma.roomAmenityMapping.findFirst({
      where: { roomId, amenityId },
    });

    if (existing) {
      return responseHandler(
        res,
        400,
        `Amenity "${amenity.amenityName}" already added to Room ${room.roomNumber}`
      );
    }

    const mapping = await prisma.roomAmenityMapping.create({
      data: {
        roomId,
        amenityId,
      },
      include: {
        room: {
          select: {
            roomNumber: true,
            roomName: true,
          },
        },
        amenity: {
          select: {
            amenityName: true,
          },
        },
      },
    });

    responseHandler(
      res,
      201,
      `Amenity "${mapping.amenity.amenityName}" added to Room ${mapping.room.roomNumber} successfully`,
      mapping
    );
  } catch (error) {
    errorHandler(res, error);
  }
};

// Remove Amenity from Room
export const removeAmenityFromRoom = async (req: Request, res: Response) => {
  try {
    const { mappingId } = req.params;

    if (!mappingId) {
      return responseHandler(res, 400, "Mapping ID is required");
    }

    const mapping = await prisma.roomAmenityMapping.findUnique({
      where: { id: mappingId },
      include: {
        room: {
          select: {
            roomNumber: true,
          },
        },
        amenity: {
          select: {
            amenityName: true,
          },
        },
      },
    });

    if (!mapping) {
      return responseHandler(res, 404, "Amenity mapping not found");
    }

    await prisma.roomAmenityMapping.delete({
      where: { id: mappingId },
    });

    responseHandler(
      res,
      200,
      `Amenity "${mapping.amenity.amenityName}" removed from Room ${mapping.room.roomNumber} successfully`
    );
  } catch (error) {
    errorHandler(res, error);
  }
};

// Get Amenities for a Room
export const getRoomAmenities = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!roomId) {
      return responseHandler(res, 400, "Room ID is required");
    }

    // Verify room exists
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!room) {
      return responseHandler(res, 404, "Room not found");
    }

    const amenities = await prisma.roomAmenityMapping.findMany({
      where: { roomId },
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
    });

    responseHandler(res, 200, "Room amenities fetched successfully", {
      roomId,
      roomNumber: room.roomNumber,
      amenitiesCount: amenities.length,
      amenities,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Bulk Add Amenities to Room
export const bulkAddAmenitiesToRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, amenityIds } = req.body;
    const { tenantId } = req.user as AuthUser;

    if (!roomId || !amenityIds || !Array.isArray(amenityIds) || amenityIds.length === 0) {
      return responseHandler(
        res,
        400,
        "Room ID and array of Amenity IDs are required"
      );
    }

    // Verify room
    const room = await prisma.room.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!room) {
      return responseHandler(res, 404, "Room not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const added = [];
      const errors = [];

      for (const amenityId of amenityIds) {
        // Verify amenity
        const amenity = await tx.roomAmenity.findFirst({
          where: { id: amenityId, tenantId },
        });

        if (!amenity) {
          errors.push(`Amenity ${amenityId} not found`);
          continue;
        }

        // Check if already added
        const existing = await tx.roomAmenityMapping.findFirst({
          where: { roomId, amenityId },
        });

        if (existing) {
          errors.push(`Amenity "${amenity.amenityName}" already added`);
          continue;
        }

        const mapping = await tx.roomAmenityMapping.create({
          data: { roomId, amenityId },
          include: {
            amenity: true,
          },
        });

        added.push(mapping);
      }

      return { added, errors };
    });

    responseHandler(res, 201, "Amenities added to room", result);
  } catch (error) {
    errorHandler(res, error);
  }
};