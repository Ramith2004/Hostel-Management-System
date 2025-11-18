import  prisma  from "../utils/prisma.ts";
import type {
  CreateAllocationDTO,
  UpdateAllocationDTO,
  BulkAllocationDTO,
} from "../types/allocation.type.ts";

export class AllocationService {
  static async createAllocation(
    tenantId: string,
    data: CreateAllocationDTO
  ) {
    // Verify student exists and belongs to tenant
    const student = await prisma.user.findFirst({
      where: { id: data.studentId, tenantId, role: "STUDENT" },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Check if student already has active allocation
    const existingAllocation = await prisma.roomAllocation.findFirst({
      where: {
        studentId: data.studentId,
        status: "ACTIVE",
      },
    });

    if (existingAllocation) {
      throw new Error(
        "Student already has an active room allocation. Please deallocate first."
      );
    }

    // Verify room exists and belongs to tenant
    const room = await prisma.room.findFirst({
      where: { id: data.roomId, tenantId },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Check room capacity
    if (room.occupied >= room.capacity) {
      throw new Error("Room is at full capacity");
    }

    // Create allocation
    const allocation = await prisma.roomAllocation.create({
      data: {
        tenantId,
        studentId: data.studentId,
        roomId: data.roomId,
        remarks: data.remarks ?? null,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        room: {
          select: { id: true, roomNumber: true, floor: true },
        },
      },
    });

    // Update room occupied count
    await prisma.room.update({
      where: { id: data.roomId },
      data: {
        occupied: { increment: 1 },
      },
    });

    // Update room status if full
    if (room.occupied + 1 >= room.capacity) {
      await prisma.room.update({
        where: { id: data.roomId },
        data: { status: "FULL" },
      });
    }

    return allocation;
  }

  static async getAllocationById(tenantId: string, allocationId: string) {
    const allocation = await prisma.roomAllocation.findFirst({
      where: { id: allocationId, tenantId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        room: {
          select: { id: true, roomNumber: true, floor: true },
        },
      },
    });

    if (!allocation) {
      throw new Error("Allocation not found");
    }

    return allocation;
  }

  static async getAllAllocations(
    tenantId: string,
    filters?: {
      status?: string;
      roomId?: string;
      studentId?: string;
    },
    pagination?: { skip: number; take: number }
  ) {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.studentId) where.studentId = filters.studentId;

    const [allocations, total] = await Promise.all([
      prisma.roomAllocation.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          room: {
            select: { id: true, roomNumber: true, floor: true },
          },
        },
        ...(pagination?.skip !== undefined && { skip: pagination.skip }),
        ...(pagination?.take !== undefined && { take: pagination.take }),
        orderBy: { allocatedDate: "desc" },
      }),
      prisma.roomAllocation.count({ where }),
    ]);

    return { allocations, total };
  }

  static async updateAllocation(
    tenantId: string,
    allocationId: string,
    data: UpdateAllocationDTO
  ) {
    const allocation = await prisma.roomAllocation.findFirst({
      where: { id: allocationId, tenantId },
    });

    if (!allocation) {
      throw new Error("Allocation not found");
    }

    // If changing room, validate new room
    if (data.roomId && data.roomId !== allocation.roomId) {
      const newRoom = await prisma.room.findFirst({
        where: { id: data.roomId, tenantId },
      });

      if (!newRoom) {
        throw new Error("New room not found");
      }

      if (newRoom.occupied >= newRoom.capacity) {
        throw new Error("New room is at full capacity");
      }

      // Decrement old room
      await prisma.room.update({
        where: { id: allocation.roomId },
        data: { occupied: { decrement: 1 }, status: "AVAILABLE" },
      });

      // Increment new room
      await prisma.room.update({
        where: { id: data.roomId },
        data: { occupied: { increment: 1 } },
      });
    }

    const updateData: any = {};
    if (data.roomId !== undefined) updateData.roomId = data.roomId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if (data.status === "INACTIVE") updateData.checkoutDate = new Date();

    const updated = await prisma.roomAllocation.update({
      where: { id: allocationId },
      data: updateData,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        room: {
          select: { id: true, roomNumber: true, floor: true },
        },
      },
    });

    return updated;
  }

  static async deallocateStudent(tenantId: string, allocationId: string) {
    const allocation = await prisma.roomAllocation.findFirst({
      where: { id: allocationId, tenantId },
    });

    if (!allocation) {
      throw new Error("Allocation not found");
    }

    const updated = await prisma.roomAllocation.update({
      where: { id: allocationId },
      data: {
        status: "INACTIVE",
        checkoutDate: new Date(),
      },
    });

    // Decrement room occupied count
    await prisma.room.update({
      where: { id: allocation.roomId },
      data: {
        occupied: { decrement: 1 },
        status: "AVAILABLE",
      },
    });

    return updated;
  }

  static async bulkAllocate(tenantId: string, data: BulkAllocationDTO) {
    const results = [];
    const errors = [];

    for (const allocation of data.allocations) {
      try {
        const result = await this.createAllocation(tenantId, {
          studentId: allocation.studentId,
          roomId: allocation.roomId,
          ...(data.remarks !== undefined && { remarks: data.remarks }),
        });
        results.push(result);
      } catch (error: any) {
        errors.push({
          studentId: allocation.studentId,
          roomId: allocation.roomId,
          error: error.message,
        });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  static async getStudentAllocationHistory(
    tenantId: string,
    studentId: string
  ) {
    const allocations = await prisma.roomAllocation.findMany({
      where: { studentId, tenantId },
      include: {
        room: {
          select: { roomNumber: true, floor: true },
        },
      },
      orderBy: { allocatedDate: "desc" },
    });

    return allocations.map((a) => ({
      id: a.id,
      roomNumber: a.room.roomNumber,
      floor: a.room.floor,
      allocatedDate: a.allocatedDate,
      checkoutDate: a.checkoutDate,
      status: a.status,
      durationDays: a.checkoutDate
        ? Math.floor(
            (a.checkoutDate.getTime() - a.allocatedDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : undefined,
    }));
  }
}