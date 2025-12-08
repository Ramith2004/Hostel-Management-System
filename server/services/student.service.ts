import prisma from "../utils/prisma.ts";
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
    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: data.email } },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // ✅ DEFAULT PASSWORD - No generation, just hardcode it
    const DEFAULT_PASSWORD = "12345678";
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    console.log(`📝 Creating student: ${data.name} (${data.email})`);
    console.log(`🔑 Default password set: ${DEFAULT_PASSWORD}`);

    // ✅ Create user with STUDENT role
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

    console.log(`✅ User created with ID: ${user.id}`);

    // ✅ Fetch room details and create room allocation if roomId provided
    let roomDetails = null;
    let roomNo = null;
    let hostelName = null;

    if (data.roomId) {
      try {
        const room = await prisma.room.findUnique({
          where: { id: data.roomId },
          include: {
            building: { select: { buildingName: true, buildingCode: true } },
            floor: { select: { floorName: true } },
          },
        });

        if (room) {
          // ✅ Create room allocation
          await prisma.roomAllocation.create({
            data: {
              tenantId,
              studentId: user.id,
              roomId: data.roomId,
              status: 'ACTIVE',
            },
          });

          // ✅ Update room occupied count
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

          console.log(`🏢 Room assigned: ${roomNo} in ${hostelName}`);
        }
      } catch (roomError: any) {
        console.error('⚠️ Error assigning room:', roomError.message);
        // Don't fail the entire student creation if room assignment fails
      }
    }

    // ✅ Create student profile with room and hostel info
    try {
      if (data.guardianName || roomNo) {
        await prisma.studentProfile.create({
          data: {
            userId: user.id,
            guardianName: data.guardianName || '',
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

        console.log(`📋 Student profile created`);
      }
    } catch (profileError: any) {
      console.error('⚠️ Error creating student profile:', profileError.message);
    }

    // ✅ SKIP EMAIL SENDING - Just log the credentials
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📧 STUDENT CREDENTIALS (SHARE WITH STUDENT)`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Email: ${data.email}`);
    console.log(`Password: ${DEFAULT_PASSWORD}`);
    console.log(`Please change password on first login`);
    console.log(`${'='.repeat(50)}\n`);

    // ✅ Optional: Try to send email, but don't fail if it doesn't work
try {
      await sendEmail({
        to: data.email,
        subject: "🏠 Your Hostel Account - Login Credentials",
        template: "student-credentials",
        data: {
          studentName: data.name,
          email: data.email,
          tempPassword: DEFAULT_PASSWORD,
          roomDetails: roomDetails ? {
            buildingName: roomDetails.buildingName,
            floorName: roomDetails.floorName,
            roomNumber: roomDetails.roomNumber,
          } : null,
        },
      });
      console.log(`✅ Credential email sent to ${data.email}`);
    } catch (emailError: any) {
      // ✅ Non-blocking error
      console.warn(`⚠️ Email failed (non-blocking): ${emailError.message}`);
      console.log(`📝 Student login: ${data.email} / ${DEFAULT_PASSWORD}`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roomDetails,
      defaultPassword: DEFAULT_PASSWORD,
    };
  }

  
  
  static async getAllStudents(tenantId: string) {
    try {
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
                  floor: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // ✅ Map the data to include room and hostel info
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
          updatedAt: student.updatedAt,
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
          currentRoom: roomInfo ? {
            roomNumber: roomInfo.roomNumber,
            roomType: roomInfo.roomType,
            capacity: roomInfo.capacity,
            occupied: roomInfo.occupied,
            building: roomInfo.building.buildingName,
            floor: roomInfo.floor?.floorName,
          } : null,
        };
      });
    } catch (error: any) {
      console.error('❌ Error fetching students:', error.message);
      throw new Error('Failed to fetch students');
    }
  }
}