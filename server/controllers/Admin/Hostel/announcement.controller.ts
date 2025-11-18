import type { Request, Response } from 'express';
import { PrismaClient, AnnouncementStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, targetRole, imageUrl, expiresAt } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const tenantId = req.user.tenantId;
    const postedBy = req.user.userId;

    const announcement = await prisma.announcement.create({
      data: {
        tenantId,
        title,
        description,
        priority: priority || 'NORMAL',
        status: 'PUBLISHED',
        postedBy,
        targetRole,
        imageUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const tenantId = req.user.tenantId;
    const userRole = req.user.role;

    const announcements = await prisma.announcement.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
        OR: [
          { targetRole: null, expiresAt: null },
          { targetRole: null, expiresAt: { gte: new Date() } },
          { targetRole: userRole as any, expiresAt: null },
          { targetRole: userRole as any, expiresAt: { gte: new Date() } }
        ],
      },
      include: {
        postedByUser: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { announcementId } = req.params;
    const { title, description, priority, status, expiresAt } = req.body;

    if (!announcementId) {
      return res.status(400).json({ success: false, message: 'Announcement ID is required' });
    }

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { title, description, priority, status, expiresAt },
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { announcementId } = req.params;

    if (!announcementId) {
      return res.status(400).json({ success: false, message: 'Announcement ID is required' });
    }

    await prisma.announcement.delete({ where: { id: announcementId } });

    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
};