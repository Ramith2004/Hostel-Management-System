import type { Request, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, paymentMode, monthYear, transactionId, remarks } = req.body;
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
    }
    const tenantId = req.user.tenantId;

    const payment = await prisma.payment.create({
      data: {
        tenantId,
        studentId,
        amount,
        paymentMode,
        monthYear,
        status: 'PAID',
        transactionId,
        remarks,
        receiptNumber: `RCP-${Date.now()}`,
      },
      include: {
        student: { select: { name: true, email: true } },
      },
    });

    // Update payment due if exists
    await prisma.paymentDue.updateMany({
      where: { tenantId, studentId, monthYear, status: 'PENDING' },
      data: {
        paidAmount: { increment: amount },
        status: 'PAID',
      },
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
    }
    const tenantId = req.user.tenantId;
    const { studentId, monthYear, status } = req.query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (monthYear) where.monthYear = monthYear;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};

export const generatePaymentDues = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
    }
    const tenantId = req.user.tenantId;
    const { monthYear } = req.body;

    // Get all active allocations
    const allocations = await prisma.roomAllocation.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        room: { include: { feeStructure: true } },
        student: { select: { id: true, name: true } },
      },
    });

    const dues = await Promise.all(
      allocations.map((allocation) =>
        prisma.paymentDue.upsert({
          where: {
            tenantId_studentId_monthYear: {
              tenantId,
              studentId: allocation.studentId,
              monthYear,
            },
          },
          create: {
            tenantId,
            studentId: allocation.studentId,
            monthYear,
            dueAmount: allocation.room.feeStructure?.totalMonthlyFee || 0,
            dueDate: new Date(monthYear + '-10'),
          },
          update: {},
        })
      )
    );

    res.status(201).json({ success: true, data: dues });
  } catch (error) {
    console.error('Error generating payment dues:', error);
    res.status(500).json({ success: false, message: 'Failed to generate payment dues' });
  }
};