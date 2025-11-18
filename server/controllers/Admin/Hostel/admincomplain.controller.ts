import type { Request, Response } from 'express';
import { PrismaClient, ComplaintStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
    }
    const tenantId = req.user.tenantId;
    const { status, priority, category, buildingId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (buildingId) where.room = { buildingId };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          student: { select: { name: true, email: true, phone: true } },
          room: {
            select: {
              roomNumber: true,
              building: { select: { buildingName: true } },
              floor: { select: { floorNumber: true } },
            },
          },
          comments: { include: { user: { select: { name: true, role: true } } } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const { complaintId } = req.params;
    const { status, resolvedAt } = req.body;

    if (!complaintId) {
      return res.status(400).json({ success: false, message: 'complaintId is required' });
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId as string },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: resolvedAt || new Date() }),
      },
      include: {
        student: { select: { name: true, email: true } },
        room: { select: { roomNumber: true } },
      },
    });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
};

export const getComplaintStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
    }
    const tenantId = req.user.tenantId;

    const [total, pending, inProgress, resolved] = await Promise.all([
      prisma.complaint.count({ where: { tenantId } }),
      prisma.complaint.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.complaint.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { tenantId, status: 'RESOLVED' } }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, inProgress, resolved },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};