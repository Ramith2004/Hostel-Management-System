import type { Request, Response } from "express";
import { AllocationService } from "../../services/allocation.service.ts";
import type {
  CreateAllocationDTO,
  UpdateAllocationDTO,
  BulkAllocationDTO,
} from "../../types/allocation.type.ts";

export const createAllocation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data: CreateAllocationDTO = req.body;

    if (!data.studentId || !data.roomId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const allocation = await AllocationService.createAllocation(
      req.user.tenantId,
      data
    );

    res.status(201).json({
      success: true,
      message: "Allocation created successfully",
      data: allocation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllocationById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { allocationId } = req.params;

    if (!allocationId) {
      return res.status(400).json({
        success: false,
        message: "Allocation ID is required",
      });
    }

    const allocation = await AllocationService.getAllocationById(
      req.user.tenantId,
      allocationId
    );

    res.status(200).json({
      success: true,
      message: "Allocation retrieved successfully",
      data: allocation,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAllocations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const take = req.query.take ? parseInt(req.query.take as string) : 10;

    const filters: Record<string, string> = {};
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.roomId) filters.roomId = req.query.roomId as string;
    if (req.query.studentId) filters.studentId = req.query.studentId as string;

    const { allocations, total } = await AllocationService.getAllAllocations(
      req.user.tenantId,
      filters,
      { skip, take }
    );

    res.status(200).json({
      success: true,
      message: "Allocations retrieved successfully",
      data: {
        allocations,
        pagination: { skip, take, total },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAllocation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { allocationId } = req.params;
    const data: UpdateAllocationDTO = req.body;

    if (!allocationId) {
      return res.status(400).json({
        success: false,
        message: "Allocation ID is required",
      });
    }

    const allocation = await AllocationService.updateAllocation(
      req.user.tenantId,
      allocationId,
      data
    );

    res.status(200).json({
      success: true,
      message: "Allocation updated successfully",
      data: allocation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deallocateStudent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { allocationId } = req.params;

    if (!allocationId) {
      return res.status(400).json({
        success: false,
        message: "Allocation ID is required",
      });
    }

    const result = await AllocationService.deallocateStudent(
      req.user.tenantId,
      allocationId
    );

    res.status(200).json({
      success: true,
      message: "Student deallocated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkAllocate = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data: BulkAllocationDTO = req.body;

    if (!data.allocations || data.allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Allocations array is required",
      });
    }

    const result = await AllocationService.bulkAllocate(
      req.user.tenantId,
      data
    );

    res.status(201).json({
      success: true,
      message: "Bulk allocation completed",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentAllocationHistory = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const history = await AllocationService.getStudentAllocationHistory(
      req.user.tenantId,
      studentId
    );

    res.status(200).json({
      success: true,
      message: "Student allocation history retrieved successfully",
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};