import  prisma  from "../utils/prisma.ts";
import type { DashboardResponse } from "../types/dashboard.type.ts";

export class DashboardService {
  static async getDashboardMetrics(tenantId: string): Promise<DashboardResponse> {
    // Room metrics
    const rooms = await prisma.room.findMany({
      where: { tenantId },
    });

    const roomStatus = await prisma.room.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
    });

    // Student metrics
    const totalStudents = await prisma.user.count({
      where: { tenantId, role: "STUDENT" },
    });

    const activeAllocations = await prisma.roomAllocation.count({
      where: { tenantId, status: "ACTIVE" },
    });

    // Complaint metrics
    const complaints = await prisma.complaint.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
    });

    // Fee metrics
    const payments = await prisma.payment.aggregate({
      where: { tenantId, status: "PAID" },
      _sum: { amount: true },
    });

    const paymentDues = await prisma.paymentDue.aggregate({
      where: { tenantId, status: "PENDING" },
      _sum: { dueAmount: true },
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.reduce((sum, room) => sum + room.occupied, 0);
    const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const complaintMap = new Map();
    complaints.forEach((c) => {
      complaintMap.set(c.status, c._count);
    });

    const roomStatusMap = new Map();
    roomStatus.forEach((r) => {
      roomStatusMap.set(r.status, r._count);
    });

    const totalDue = Number(paymentDues._sum.dueAmount || 0);
    const totalCollected = Number(payments._sum.amount || 0);

    return {
      metrics: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate: parseFloat(occupancyRate.toFixed(2)),
        totalStudents,
        activeComplaints: complaintMap.get("IN_PROGRESS") || 0,
        resolvedComplaints: complaintMap.get("RESOLVED") || 0,
        pendingPayments: await prisma.paymentDue.count({
          where: { tenantId, status: "PENDING" },
        }),
        totalFeeCollected: totalCollected,
        totalStudentsThisMonth: activeAllocations,
      },
      roomStatus: {
        available: roomStatusMap.get("AVAILABLE") || 0,
        full: roomStatusMap.get("FULL") || 0,
        maintenance: roomStatusMap.get("MAINTENANCE") || 0,
        reserved: roomStatusMap.get("RESERVED") || 0,
      },
      complaints: {
        total: complaints.reduce((sum, c) => sum + c._count, 0),
        pending: complaintMap.get("PENDING") || 0,
        inProgress: complaintMap.get("IN_PROGRESS") || 0,
        resolved: complaintMap.get("RESOLVED") || 0,
        closed: complaintMap.get("CLOSED") || 0,
        rejected: complaintMap.get("REJECTED") || 0,
      },
      fees: {
        totalDue,
        totalCollected,
        totalDefaulters:
          (await prisma.paymentDue.findMany({
            where: { tenantId, status: "OVERDUE" },
            distinct: ["studentId"],
          })).length || 0,
        collectionRate:
          totalDue + totalCollected > 0
            ? parseFloat(
                (
                  (totalCollected / (totalDue + totalCollected)) *
                  100
                ).toFixed(2)
              )
            : 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  static async getOccupancyTrend(tenantId: string, months: number = 12) {
    const allocations = await prisma.roomAllocation.groupBy({
      by: ["allocatedDate"],
      where: { tenantId },
      _count: true,
    });

    return allocations;
  }

  static async getComplaintTrend(tenantId: string, days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const complaints = await prisma.complaint.groupBy({
      by: ["status"],
      where: {
        tenantId,
        createdAt: { gte: fromDate },
      },
      _count: true,
    });

    return complaints;
  }
}