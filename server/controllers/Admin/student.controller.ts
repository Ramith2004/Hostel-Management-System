import type { Request, Response } from "express";
import { StudentService } from "../../services/student.service.ts";

export const createStudent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { 
      name, 
      email, 
      phone, 
      roomId,
      guardianName,
      guardianPhone,
      address,
      dateOfBirth,
      emergencyContact,
      emergencyContactPhone,
      course,
      year,
      enrollmentNumber
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    const student = await StudentService.createStudent(
      req.user.tenantId,
      { 
        name, 
        email, 
        phone,
        roomId,
        guardianName,
        guardianPhone,
        address,
        dateOfBirth,
        emergencyContact,
        emergencyContactPhone,
        course,
        year,
        enrollmentNumber
      }
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully. Credentials sent to email.",
      data: student,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const students = await StudentService.getAllStudents(req.user.tenantId);

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};