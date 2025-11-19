import prisma from "../utils/prisma.ts";
import { generateRandomPassword } from "../utils/password.ts";
import { sendEmail } from "../utils/email.ts";
import bcrypt from "bcrypt";

export class StudentService {
  static async createStudent(
    tenantId: string,
    data: { 
      name: string; 
      email: string; 
      phone: string;
      roomId?: string;
      guardianName?: string;
      guardianPhone?: string;
      address?: string;
      dateOfBirth?: string;
      emergencyContact?: string;
      emergencyContactPhone?: string;
      course?: string;
      year?: string;
      enrollmentNumber?: string;
    }
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: data.email } },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user with STUDENT role
    const user = await prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    // Fetch room details and create room allocation if roomId provided
    let roomDetails = null;
    let roomNo = null;
    let hostelName = null;

    if (data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
        include: {
          building: { select: { buildingName: true, buildingCode: true } },
          floor: { select: { floorName: true } },
        },
      });

      if (room) {
        // Create room allocation
        await prisma.roomAllocation.create({
          data: {
            tenantId,
            studentId: user.id,
            roomId: data.roomId,
            status: 'ACTIVE',
          },
        });

        // Update room occupied count
        await prisma.room.update({
          where: { id: data.roomId },
          data: { occupied: { increment: 1 } },
        });

        roomNo = room.roomNumber;
        hostelName = room.building?.buildingName || null;

        roomDetails = {
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          capacity: room.capacity,
          buildingName: room.building.buildingName,
          floorName: room.floor.floorName,
          hostelName,
        };
    }

    // Create student profile with room and hostel info
    if (data.guardianName) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
          enrollmentNumber: data.enrollmentNumber || null,
          course: data.course || null,
          year: data.year || null,
          roomNo: roomNo,
          hostelName: hostelName,
        },
      });
    }

    // Send credentials via email
    await sendEmail({
      to: data.email,
      subject: "Your Hostel Account Credentials",
      template: "student-credentials",
      data: {
        studentName: data.name,
        email: data.email,
        tempPassword,
        loginUrl: process.env.FRONTEND_URL,
        roomDetails,
      },
    });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roomDetails,
        message: "Credentials sent to student email",
      };
    }
  }
  
    static async getAllStudents(tenantId: string) {
    const students = await prisma.user.findMany({
      where: {
        tenantId,
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
        roomAllocations: {
          where: { status: 'ACTIVE' },
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    // Map the data to include room and hostel info
    return students.map((student) => {
      const allocation = student.roomAllocations?.[0];
      const roomInfo = allocation?.room;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        status: student.status,
        createdAt: student.createdAt,
        studentProfile: student.studentProfile
          ? {
              ...student.studentProfile,
              roomNo:
                student.studentProfile.roomNo ||
                roomInfo?.roomNumber ||
                null,
              hostelName:
                student.studentProfile.hostelName ||
                roomInfo?.building?.buildingName ||
                null,
            }
          : null,
      };
    });
  }
}