import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registerVisitor = async (req: Request, res: Response) => {
  try {
    const {
      visitorName,
      visitorPhone,
      visitorEmail,
      idProofType,
      idProofNumber,
      studentId,
      purpose,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const tenantId = req.user.tenantId;
    const recordedBy = req.user.userId;

    const visitor = await prisma.visitor.create({
      data: {
        tenantId,
        visitorName,
        visitorPhone,
        visitorEmail,
        idProofType,
        idProofNumber,
        studentId,
        purpose,
        recordedBy,
      },
      include: {
        student: { select: { name: true, phone: true } },
      },
    });

    res.status(201).json({ success: true, data: visitor });
  } catch (error) {
    console.error('Error registering visitor:', error);
    res.status(500).json({ success: false, message: 'Failed to register visitor' });
  }
};

export const recordVisitorExit = async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.params;

    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing visitorId' });
    }

    const visitor = await prisma.visitor.update({
      where: { id: visitorId },
      data: { exitTime: new Date() },
    });

    res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    console.error('Error recording exit:', error);
    res.status(500).json({ success: false, message: 'Failed to record exit' });
  }
};

export const getVisitorHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    const tenantId = req.user.tenantId;
    const { studentId, date } = req.query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.entryTime = { gte: startDate, lt: endDate };
    }

    const visitors = await prisma.visitor.findMany({
      where,
      include: {
        student: { select: { name: true } },
        recordedByUser: { select: { name: true } },
      },
      orderBy: { entryTime: 'desc' },
    });

    res.status(200).json({ success: true, data: visitors });
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visitor history' });
  }
};