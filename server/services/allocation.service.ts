import prisma from "../utils/prisma.ts";
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
    // ✅ INCLUDE active allocations to get accurate occupied count
    const room = await prisma.room.findFirst({
      where: { id: data.roomId, tenantId },
      include: {
        roomAllocations: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // ✅ CHECK CAPACITY USING ACTUAL COUNT FROM DATABASE
    const currentOccupancy = room.roomAllocations.length;
    if (currentOccupancy >= room.capacity) {
      throw new Error(
        `Room ${room.roomNumber} is at full capacity (${currentOccupancy}/${room.capacity}). Cannot allocate more students.`
      );
    }

    // ✅ CHECK ROOM STATUS
    if (room.status === "MAINTENANCE" || room.status === "INACTIVE") {
      throw new Error(`Room is ${room.status} and cannot be allocated`);
    }

    // Create allocation with transaction
    const allocation = await prisma.$transaction(async (tx) => {
      // Create the allocation
      const newAllocation = await tx.roomAllocation.create({
        data: {
          tenantId,
          studentId: data.studentId,
          roomId: data.roomId,
          status: "ACTIVE",
          remarks: data.remarks ?? null,
          allocatedDate: new Date(),
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

      // ✅ GET UPDATED COUNT
      const updatedOccupancy = await tx.roomAllocation.count({
        where: {
          roomId: data.roomId,
          status: "ACTIVE",
        },
      });

      // ✅ SET PROPER ROOM STATUS
      const newRoomStatus = updatedOccupancy >= room.capacity ? "FULL" : "OCCUPIED";

      // Update room occupied count and status
      await tx.room.update({
        where: { id: data.roomId },
        data: {
          occupied: updatedOccupancy,
          status: newRoomStatus,
        },
      });

      console.log(
        `✅ Allocation created: Student ${data.studentId} → Room ${room.roomNumber} (${updatedOccupancy}/${room.capacity})`
      );

      return newAllocation;
    });

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
        include: {
          roomAllocations: {
            where: { status: "ACTIVE" },
          },
        },
      });

      if (!newRoom) {
        throw new Error("New room not found");
      }

      // ✅ CHECK ACTUAL OCCUPANCY
      const newRoomOccupancy = newRoom.roomAllocations.length;
      if (newRoomOccupancy >= newRoom.capacity) {
        throw new Error(
          `New room is at full capacity (${newRoomOccupancy}/${newRoom.capacity})`
        );
      }

      // Decrement old room
      const oldRoomOccupancy = await prisma.roomAllocation.count({
        where: {
          roomId: allocation.roomId,
          status: "ACTIVE",
          id: { not: allocationId },
        },
      });

      await prisma.room.update({
        where: { id: allocation.roomId },
        data: {
          occupied: oldRoomOccupancy,
          status: oldRoomOccupancy === 0 ? "AVAILABLE" : "OCCUPIED",
        },
      });

      // Increment new room
      const updatedNewRoomOccupancy = newRoomOccupancy + 1;
      const newRoomStatus = updatedNewRoomOccupancy >= newRoom.capacity ? "FULL" : "OCCUPIED";

      await prisma.room.update({
        where: { id: data.roomId },
        data: {
          occupied: updatedNewRoomOccupancy,
          status: newRoomStatus,
        },
      });
    }

    const updateData: any = {};
    if (data.roomId !== undefined) updateData.roomId = data.roomId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if (data.status === "CHECKED_OUT") updateData.checkoutDate = new Date();

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
      include: {
        room: true,
      },
    });

    if (!allocation) {
      throw new Error("Allocation not found");
    }

    // Update allocation status
    const updated = await prisma.$transaction(async (tx) => {
      const dealloc = await tx.roomAllocation.update({
        where: { id: allocationId },
        data: {
          status: "CHECKED_OUT",
          checkoutDate: new Date(),
        },
      });

      // ✅ GET REMAINING ACTIVE ALLOCATIONS
      const remainingOccupancy = await tx.roomAllocation.count({
        where: {
          roomId: allocation.roomId,
          status: "ACTIVE",
        },
      });

      // ✅ SET PROPER ROOM STATUS
      const newRoomStatus = remainingOccupancy === 0 ? "AVAILABLE" : "OCCUPIED";

      await tx.room.update({
        where: { id: allocation.roomId },
        data: {
          occupied: remainingOccupancy,
          status: newRoomStatus,
        },
      });

      console.log(
        `✅ Student deallocated from Room ${allocation.room.roomNumber}. Remaining: ${remainingOccupancy}/${allocation.room.capacity}`
      );

      return dealloc;
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