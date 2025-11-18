import type { Request, Response } from 'express';
import { PrismaClient, MaintenanceCategory, MaintenanceStatus, MaintenancePriority } from '@prisma/client';

const prisma = new PrismaClient();

export const createMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    const { buildingId, roomId, category, description, priority, estimatedCost } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found in request' });
    }
    const tenantId = req.user.tenantId;
    const createdById = req.user.userId;

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        tenantId,
        buildingId,
        roomId,
        createdById,
        category,
        description,
        priority: priority || 'MEDIUM',
        estimatedCost,
      },
      include: {
        building: { select: { buildingName: true } },
        room: { select: { roomNumber: true } },
        createdBy: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: maintenanceRequest });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ success: false, message: 'Failed to create maintenance request' });
  }
};

export const getAllMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found in request' });
    }
    const tenantId = req.user.tenantId;
    const { status, priority, category, buildingId } = req.query;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (buildingId) where.buildingId = buildingId;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        building: { select: { buildingName: true } },
        room: { select: { roomNumber: true } },
        assignedTo: { select: { name: true, email: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests' });
  }
};

export const assignMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { assignedToId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id: requestId as string },
      data: {
        assignedToId,
        status: 'ASSIGNED',
      },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    res.status(500).json({ success: false, message: 'Failed to assign request' });
  }
};

export const updateMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status, actualCost, notes } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id: requestId as string },
      data: {
        status,
        actualCost,
        notes,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};