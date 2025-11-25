import { PrismaClient, type Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from "@prisma/client";
import type { CreateComplaintDTO, UpdateComplaintDTO, ResolveComplaintDTO, ComplaintFilterParams, ComplaintStats } from "../types/complaint.type.ts";

const prisma = new PrismaClient();

export class ComplaintService {
  prisma = prisma;

  async createComplaint(tenantId: string, data: CreateComplaintDTO): Promise<Complaint> {
    const complaintData: any = {
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      attachmentUrl: data.attachmentUrl ?? null,
      status: "PENDING",
      tenant: {
        connect: { id: tenantId },
      },
      student: {
        connect: { id: data.studentId },
      },
    };

    if (data.roomId) {
      complaintData.room = {
        connect: { id: data.roomId },
      };
    }

    return prisma.complaint.create({
      data: complaintData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomName: true,
          },
        },
      },
    });
  }

  async getComplaintById(complaintId: string, tenantId: string) {
    return prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomName: true,
            floor: {
              select: {
                floorNumber: true,
              },
            },
          },
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async getComplaints(tenantId: string, filters: ComplaintFilterParams) {
    const { 
      status, 
      priority, 
      category, 
      studentId, 
      roomId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const whereClause: any = {
      tenantId,
    };

    // Add studentId filter
    if (studentId) {
      whereClause.studentId = studentId;
    }

    // Add status filter - treat as string first, then cast
    if (status) {
      const statusStr = String(status).toUpperCase();
      if (statusStr !== "ALL" && statusStr !== "") {
        whereClause.status = statusStr as ComplaintStatus;
        console.log("Status filter applied:", statusStr);
      }
    }
    
    // Add priority filter - treat as string first, then cast
    if (priority) {
      const priorityStr = String(priority).toUpperCase();
      if (priorityStr !== "ALL" && priorityStr !== "") {
        whereClause.priority = priorityStr as ComplaintPriority;
        console.log("Priority filter applied:", priorityStr);
      }
    }
    
    // Add category filter - treat as string first, then cast
    if (category) {
      const categoryStr = String(category).toUpperCase();
      if (categoryStr !== "ALL" && categoryStr !== "") {
        whereClause.category = categoryStr as ComplaintCategory;
        console.log("Category filter applied:", categoryStr);
      }
    }
    
    // Add roomId filter
    if (roomId) {
      whereClause.roomId = roomId;
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    console.log("=== SERVICE WHERE CLAUSE ===");
    console.log(JSON.stringify(whereClause, null, 2));
    console.log("========================");

    try {
      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where: whereClause,
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            room: {
              select: {
                id: true,
                roomNumber: true,
              },
            },
            comments: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.complaint.count({ where: whereClause }),
      ]);

      console.log(`=== QUERY RESULTS ===`);
      console.log(`Found ${complaints.length} complaints out of ${total} total`);
      console.log(`Complaints:`, complaints.map(c => ({ id: c.id, title: c.title, category: c.category, priority: c.priority, status: c.status })));
      console.log("==================");

      return {
        data: complaints,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("=== PRISMA QUERY ERROR ===");
      console.error(error);
      throw error;
    }
  }

  async getStudentComplaints(tenantId: string, studentId: string, page = 1, limit = 10) {
    return this.getComplaints(tenantId, {
      studentId,
      page,
      limit,
    });
  }

  async updateComplaintStatus(complaintId: string, tenantId: string, status: ComplaintStatus): Promise<Complaint> {
    return prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status,
        ...(status === "RESOLVED" || status === "CLOSED" ? { resolvedAt: new Date() } : {}),
      },
    });
  }

  async resolveComplaint(complaintId: string, tenantId: string, data: ResolveComplaintDTO): Promise<Complaint> {
    return prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
        resolvedBy: data.resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }

  async getComplaintStats(tenantId: string): Promise<ComplaintStats> {
    const complaints = await prisma.complaint.findMany({
      where: { tenantId },
      select: {
        status: true,
      },
    });

    const stats: ComplaintStats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "PENDING").length,
      acknowledged: complaints.filter((c) => c.status === "ACKNOWLEDGED").length,
      inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      resolved: complaints.filter((c) => c.status === "RESOLVED").length,
      closed: complaints.filter((c) => c.status === "CLOSED").length,
      rejected: complaints.filter((c) => c.status === "REJECTED").length,
    };

    return stats;
  }

  async getComplaintsByCategory(tenantId: string) {
    const complaints = await prisma.complaint.groupBy({
      by: ["category"],
      where: { tenantId },
      _count: true,
    });

    return complaints.map((c) => ({
      category: c.category,
      count: c._count,
    }));
  }

  async deleteComplaint(complaintId: string, tenantId: string): Promise<Complaint> {
    return prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: "CLOSED",
      },
    });
  }
}

export const complaintService = new ComplaintService();