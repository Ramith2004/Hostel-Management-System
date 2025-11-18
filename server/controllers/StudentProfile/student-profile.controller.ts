import type { Request, Response } from "express";
import { StudentProfileService } from "../../services/student-profile.service.ts";
import type { CreateStudentProfileDTO, UpdateStudentProfileDTO } from "../../types/student-profile.type.ts";

export const createStudentProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data: CreateStudentProfileDTO = req.body;

    // Validate required fields
    if (!data.guardianName || !data.guardianPhone || !data.address || !data.emergencyContact || !data.dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const profile = await StudentProfileService.createProfile(
      req.user.userId,
      req.user.tenantId,
      data
    );

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: profile,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await StudentProfileService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data: UpdateStudentProfileDTO = req.body;

    const profile = await StudentProfileService.updateProfile(
      req.user.userId,
      data
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentWithRoom = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const student = await StudentProfileService.getStudentWithAllocation(
      req.user.userId,
      req.user.tenantId
    );

    res.status(200).json({
      success: true,
      message: "Student data retrieved successfully",
      data: student,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};