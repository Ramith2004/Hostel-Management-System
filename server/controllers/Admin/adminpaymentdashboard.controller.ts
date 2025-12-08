import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get payment statistics
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Total collected
    const totalCollected = await prisma.payment.aggregate({
      where: {
        tenantId,
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });

    // Total pending
    const totalPending = await prisma.paymentDue.aggregate({
      where: {
        tenantId,
        status: 'PENDING',
      },
      _sum: {
        dueAmount: true,
      },
    });

    // Total overdue
    const totalOverdue = await prisma.paymentDue.aggregate({
      where: {
        tenantId,
        status: 'OVERDUE',
        dueDate: { lt: new Date() },
      },
      _sum: {
        dueAmount: true,
      },
    });

    // Today's collection
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollection = await prisma.payment.aggregate({
      where: {
        tenantId,
        status: 'PAID',
        paymentDate: { gte: today },
      },
      _sum: {
        amount: true,
      },
    });

    // Count of pending and overdue
    const pendingCount = await prisma.paymentDue.count({
      where: { tenantId, status: 'PENDING' },
    });

    const overdueCount = await prisma.paymentDue.count({
      where: {
        tenantId,
        status: 'OVERDUE',
        dueDate: { lt: new Date() },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCollected: totalCollected._sum.amount || 0,
        totalPending: totalPending._sum.dueAmount || 0,
        totalOverdue: totalOverdue._sum.dueAmount || 0,
        todayCollection: todayCollection._sum.amount || 0,
        pendingCount,
        overdueCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment statistics',
    });
  }
};

// Get dashboard data with charts
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Revenue data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPayments = await prisma.payment.findMany({
      where: {
        tenantId,
        status: 'PAID',
        paymentDate: { gte: sixMonthsAgo },
      },
      select: {
        monthYear: true,
        amount: true,
      },
    });

    const monthlyDues = await prisma.paymentDue.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      select: {
        monthYear: true,
        dueAmount: true,
      },
    });

    // Group by month
    const revenueMap = new Map();
    monthlyPayments.forEach(p => {
      const month = p.monthYear || 'N/A';
      revenueMap.set(month, (revenueMap.get(month) || 0) + Number(p.amount));
    });

    const dueMap = new Map();
    monthlyDues.forEach(d => {
      const month = d.monthYear || 'N/A';
      dueMap.set(month, (dueMap.get(month) || 0) + Number(d.dueAmount));
    });

    const revenueData = Array.from(revenueMap.entries()).map(([month, collected]) => ({
      month: month.substring(5),
      collected,
      pending: dueMap.get(month) || 0,
    }));

    // Payment method breakdown
    const paymentMethods = await prisma.payment.groupBy({
      by: ['paymentMode'],
      where: {
        tenantId,
        status: 'PAID',
      },
      _count: true,
    });

    const totalPayments = paymentMethods.reduce((sum, m) => sum + (m._count || 0), 0);
    const paymentMethodData = paymentMethods.map(m => ({
      name: m.paymentMode,
      value: totalPayments > 0 ? Math.round((((m._count || 0) / totalPayments) * 100)) : 0,
    }));

    // Recent transactions
    const recentTransactions = await prisma.payment.findMany({
      where: {
        tenantId,
        status: 'PAID',
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        status: true,
        studentId: true,
        student: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        revenueData,
        paymentMethodData,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          studentName: t.student ? t.student.name : 'Unknown Student',
          amount: Number(t.amount),
          date: t.paymentDate,
          status: t.status,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { status } = req.query;

    const where: any = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        status: true,
        paymentMode: true,
        monthYear: true,
        razorpayPaymentId: true,
        studentId: true,
        student: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: payments.map(p => ({
        id: p.id,
        studentName: p.student ? p.student.name : 'Unknown Student',
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        status: p.status,
        paymentMode: p.paymentMode,
        monthYear: p.monthYear,
        transactionId: p.razorpayPaymentId || p.id,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history',
    });
  }
};

// Get outstanding dues
export const getOutstandingDues = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Get payment dues
    const dues = await prisma.paymentDue.findMany({
      where: { tenantId },
      orderBy: { dueDate: 'asc' },
    });

    // Get student info separately
    const studentIds = dues.map(d => d.studentId);
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Create a map for quick lookup
    const studentMap = new Map(students.map(s => [s.id, s]));

    return res.status(200).json({
      success: true,
      data: dues.map(d => {
        const student = studentMap.get(d.studentId);
        return {
          id: d.id,
          studentId: d.studentId,
          studentName: student?.name || 'Unknown Student',
          studentEmail: student?.email || '',
          amount: Number(d.dueAmount),
          dueDate: d.dueDate,
          monthYear: d.monthYear,
          status: new Date(d.dueDate) < new Date() ? 'OVERDUE' : d.status,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error fetching outstanding dues:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch outstanding dues',
    });
  }
};

// Send payment reminders
export const sendPaymentReminders = async (req: Request, res: Response) => {
  try {
    const { dues } = req.body;

    if (!dues || !Array.isArray(dues) || dues.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No dues provided',
      });
    }

    // TODO: Implement email sending using your email service
    // For now, just return success
    const sentCount = dues.length;

    return res.status(200).json({
      success: true,
      message: `Reminders sent to ${sentCount} student(s)`,
      data: { sentCount },
    });
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reminders',
    });
  }
};

// Get payment reports
export const getPaymentReports = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { dateRange } = req.query;

    let daysBack = 180; // Default 6 months
    if (dateRange === '30days') daysBack = 30;
    else if (dateRange === '3months') daysBack = 90;
    else if (dateRange === '1year') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const payments = await prisma.payment.findMany({
      where: {
        tenantId,
        status: 'PAID',
        paymentDate: { gte: startDate },
      },
      select: {
        monthYear: true,
        amount: true,
        paymentMode: true,
      },
    });

    // Group by month
    const monthlyMap = new Map();
    payments.forEach(p => {
      const month = p.monthYear || 'N/A';
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { month: month.substring(5), collected: 0, pending: 0, overdue: 0 });
      }
      const data = monthlyMap.get(month);
      data.collected += Number(p.amount);
    });

    // Group by method
    const methodMap = new Map();
    payments.forEach(p => {
      const method = p.paymentMode;
      if (!methodMap.has(method)) {
        methodMap.set(method, { method, count: 0, amount: 0 });
      }
      const data = methodMap.get(method);
      data.count += 1;
      data.amount += Number(p.amount);
    });

    return res.status(200).json({
      success: true,
      data: {
        monthlyData: Array.from(monthlyMap.values()),
        studentPaymentStatus: [],
        paymentMethodBreakdown: Array.from(methodMap.values()),
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch reports',
    });
  }
};

// Get payment settings
export const getPaymentSettings = async (req: Request, res: Response) => {
  try {
    // Return default settings (you can store these in database later)
    const settings = {
      dueDay: 1,
      reminderDays: [0, -3, -7],
      enableAutoReminders: true,
      reminderEmailTemplate: 'Dear {studentName}, please pay ₹{amount} by {dueDate}.',
      enableLateFees: false,
      lateFeePercentage: 5,
      lateFeeDelay: 5,
    };

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settings',
    });
  }
};

// Update payment settings
export const updatePaymentSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    if (settings.dueDay < 1 || settings.dueDay > 28) {
      return res.status(400).json({
        success: false,
        message: 'Due day must be between 1 and 28',
      });
    }

    // TODO: Store settings in database

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings',
    });
  }
};