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

export const createFloor = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const { buildingId, floorNumber, floorName, description } = req.body;

    // Check if floor number already exists in this building
    const existingFloor = await prisma.floor.findFirst({
      where: {
        buildingId,
        floorNumber,
      },
    });

    if (existingFloor) {
      return responseHandler(
        res,
        400,
        "Floor with this number already exists in the building"
      );
    }

    // Use transaction to create floor and update building
    const result = await prisma.$transaction(async (tx) => {
      // Create the floor
      const floor = await tx.floor.create({
        data: {
          tenantId,
          buildingId,
          floorNumber,
          floorName: floorName || `Floor ${floorNumber}`,
          description,
        },
      });

      // Count total floors in the building
      const totalFloorsCount = await tx.floor.count({
        where: { buildingId },
      });

      // Update building's totalFloors count
      await tx.building.update({
        where: { id: buildingId },
        data: { totalFloors: totalFloorsCount },
      });

      return floor;
    });

    responseHandler(res, 201, "Floor created successfully", result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getFloorsByBuilding = async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!buildingId) {
      return responseHandler(res, 400, "Building ID is required");
    }

    const floors = await prisma.floor.findMany({
      where: {
        buildingId,
        tenantId,
      },
      include: {
        rooms: true,
      },
      orderBy: { floorNumber: "asc" },
    });

    responseHandler(res, 200, "Floors fetched successfully", floors);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getFloorById = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!floorId) {
      return responseHandler(res, 400, "Floor ID is required");
    }

    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        tenantId,
      },
      include: {
        rooms: {
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        building: {
          select: {
            buildingName: true,
            buildingCode: true,
          }
        }
      },
    });

    if (!floor) {
      return responseHandler(res, 404, "Floor not found");
    }

    responseHandler(res, 200, "Floor fetched successfully", floor);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    const { tenantId } = req.user as AuthUser;
    const updateData = req.body;

    if (!floorId) {
      return responseHandler(res, 400, "Floor ID is required");
    }

    const floor = await prisma.floor.updateMany({
      where: {
        id: floorId,
        tenantId,
      },
      data: updateData,
    });

    if (floor.count === 0) {
      return responseHandler(res, 404, "Floor not found");
    }

    const updatedFloor = await prisma.floor.findUnique({
      where: { id: floorId },
    });

    responseHandler(res, 200, "Floor updated successfully", updatedFloor);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const deleteFloor = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!floorId) {
      return responseHandler(res, 400, "Floor ID is required");
    }

    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        tenantId,
      },
    });

    if (!floor) {
      return responseHandler(res, 404, "Floor not found");
    }

    // Use transaction to delete floor and update building
    await prisma.$transaction(async (tx) => {
      // Delete the floor
      await tx.floor.delete({
        where: { id: floorId },
      });

      // Count remaining floors in the building
      const totalFloorsCount = await tx.floor.count({
        where: { buildingId: floor.buildingId },
      });

      // Update building's totalFloors count
      await tx.building.update({
        where: { id: floor.buildingId },
        data: { totalFloors: totalFloorsCount },
      });
    });

    responseHandler(res, 200, "Floor deleted successfully");
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getFloorStats = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!floorId) {
      return responseHandler(res, 400, "Floor ID is required");
    }

    const floor = await prisma.floor.findFirst({
      where: {
        id: floorId,
        tenantId,
      },
      include: {
        building: {
          select: {
            buildingName: true,
          }
        }
      }
    });

    if (!floor) {
      return responseHandler(res, 404, "Floor not found");
    }

    const stats = {
      floorNumber: floor.floorNumber,
      floorName: floor.floorName,
      buildingName: floor.building.buildingName,
      totalRooms: floor.totalRooms,
      occupiedRooms: floor.occupiedRooms,
      availableRooms: floor.totalRooms - floor.occupiedRooms,
      occupancyRate: floor.totalRooms > 0 
        ? ((floor.occupiedRooms / floor.totalRooms) * 100).toFixed(2) 
        : "0",
      status: floor.status,
    };

    responseHandler(res, 200, "Floor stats fetched successfully", stats);
  } catch (error) {
    errorHandler(res, error);
  }
};