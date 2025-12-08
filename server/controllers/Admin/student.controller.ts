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

    // ✅ Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
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

    // ✅ UPDATED: Return success with default credentials
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        roomDetails: student.roomDetails,
        defaultPassword: "12345678",
        passwordNote: "Please share this default password with the student. They should change it on first login.",
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating student:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create student",
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
      count: students.length,
    });
  } catch (error: any) {
    console.error('❌ Error fetching students:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch students",
    });
  }
};