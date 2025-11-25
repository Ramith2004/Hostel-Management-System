import type { Request, Response } from "express";
import prisma from "../../../utils/prisma.ts";
import { errorHandler } from "../../../utils/error-handler.ts";
import { sendResponse } from "../../../utils/response-handler.ts";

type AuthUser = {
  userId: string;
  role: string;
  tenantId: string;
};

export const createBuilding = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, "Unauthorized: user not found");
    }
    const { tenantId } = req.user as AuthUser;
    const {
      buildingName,
      buildingCode,
      description,
      address,
      contactPerson,
      contactPhone,
      imageUrl,
      constructedYear,
    } = req.body;

    const building = await prisma.building.create({
      data: {
        tenantId,
        buildingName,
        buildingCode,
        description,
        totalFloors: 0, // Initialize with 0, will be updated when floors are added
        address,
        contactPerson,
        contactPhone,
        imageUrl,
        constructedYear,
      },
    });

    sendResponse(res, 201, "Building created successfully", building);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getAllBuildings = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user as AuthUser;
    const { skip = 0, take = 10, status } = req.query;

    const where: any = { tenantId };
    if (status) where.status = status;

    const buildings = await prisma.building.findMany({
      where,
      skip: parseInt(skip as string),
      take: parseInt(take as string),
      include: {
        floors: {
          orderBy: { floorNumber: 'asc' }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.building.count({ where });

    sendResponse(res, 200, "Buildings fetched successfully", {
      buildings,
      total,
      page: Math.ceil(parseInt(skip as string) / parseInt(take as string)) + 1,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getBuildingById = async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!buildingId) {
      return sendResponse(res, 400, "Building ID is required");
    }

    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        tenantId,
      },
      include: {
        floors: {
          include: {
            rooms: true,
          },
          orderBy: { floorNumber: 'asc' }
        },
      },
    });

    if (!building) {
      return sendResponse(res, 404, "Building not found");
    }

    sendResponse(res, 200, "Building fetched successfully", building);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const updateBuilding = async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    if (!req.user) {
      return sendResponse(res, 401, "Unauthorized: user not found");
    }
    if (!buildingId) {
      return sendResponse(res, 400, "Building ID is required");
    }
    const { tenantId } = req.user as AuthUser;
    const { totalFloors, ...updateData } = req.body; // Exclude totalFloors from manual updates

    const building = await prisma.building.updateMany({
      where: {
        id: buildingId,
        tenantId,
      },
      data: updateData,
    });

    if (building.count === 0) {
      return sendResponse(res, 404, "Building not found");
    }

    const updatedBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    sendResponse(res, 200, "Building updated successfully", updatedBuilding);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const deleteBuilding = async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const { tenantId } = req.user as AuthUser;

    if (!buildingId) {
      return sendResponse(res, 400, "Building ID is required");
    }

    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        tenantId,
      },
    });

    if (!building) {
      return sendResponse(res, 404, "Building not found");
    }

    await prisma.building.delete({
      where: { id: buildingId },
    });

    sendResponse(res, 200, "Building deleted successfully");
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getBuildingStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, "Unauthorized: user not found");
    }
    const { tenantId } = req.user as AuthUser;
    const { buildingId } = req.params;

    if (!buildingId) {
      return sendResponse(res, 400, "Building ID is required");
    }

    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        tenantId,
      },
      include: {
        floors: true,
      }
    });

    if (!building) {
      return sendResponse(res, 404, "Building not found");
    }

    const stats = {
      totalFloors: building.totalFloors,
      actualFloors: building.floors.length,
      totalRooms: building.totalRooms,
      occupiedRooms: building.occupiedRooms,
      availableRooms: building.totalRooms - building.occupiedRooms,
      occupancyRate: building.totalRooms > 0 
        ? ((building.occupiedRooms / building.totalRooms) * 100).toFixed(2)
        : "0",
    };

    sendResponse(res, 200, "Building stats fetched successfully", stats);
  } catch (error) {
    errorHandler(res, error);
  }
};