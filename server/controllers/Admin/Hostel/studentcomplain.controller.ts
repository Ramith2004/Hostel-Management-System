import type { Request, Response } from 'express';
import { PrismaClient, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { roomId, category, title, description, priority, attachmentUrl } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const studentId = req.user.userId;
    const tenantId = req.user.tenantId;

    const complaint = await prisma.complaint.create({
      data: {
        tenantId,
        studentId,
        roomId,
        category,
        title,
        description,
        priority: priority || 'MEDIUM',
        attachmentUrl,
      },
      include: {
        student: { select: { name: true, email: true } },
        room: { select: { roomNumber: true, building: { select: { buildingName: true } } } },
      },
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to create complaint' });
  }
};

export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const studentId = req.user.userId;
    const { status, category } = req.query;

    const complaints = await prisma.complaint.findMany({
      where: {
        studentId,
        ...(status && { status: status as ComplaintStatus }),
        ...(category && { category: category as ComplaintCategory }),
      },
      include: {
        room: { select: { roomNumber: true, building: { select: { buildingName: true } } } },
        comments: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

export const addComplaintComment = async (req: Request, res: Response) => {
  try {
    const { complaintId } = req.params;
    const { comment, attachmentUrl } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    if (!complaintId) {
      return res.status(400).json({ success: false, message: 'Complaint ID is required' });
    }
    const userId = req.user.userId;

    const complaintComment = await prisma.complaintComment.create({
      data: {
        complaintId: complaintId as string,
        userId,
        comment,
        attachmentUrl,
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: complaintComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};