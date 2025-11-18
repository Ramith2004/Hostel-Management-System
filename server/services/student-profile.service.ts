import  prisma  from "../utils/prisma.ts";
import type { CreateStudentProfileDTO, UpdateStudentProfileDTO } from "../types/student-profile.type.ts";

export class StudentProfileService {
  static async createProfile(
    userId: string,
    tenantId: string,
    data: CreateStudentProfileDTO
  ) {
    // Check if profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error("Student profile already exists");
    }

    // Verify student exists in user table
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new Error("User not found or unauthorized");
    }

    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        address: data.address,
        emergencyContact: data.emergencyContact,
        dateOfBirth: new Date(data.dateOfBirth),
        bloodGroup: data.bloodGroup ?? null,
        enrollmentNumber: data.enrollmentNumber ?? null,
        course: data.course ?? null,
        year: data.year ?? null,
      },
    });

    return profile;
  }

  static async getProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  }

  static async updateProfile(
    userId: string,
    data: UpdateStudentProfileDTO
  ) {
    const updateData: Record<string, any> = {};
    
    if (data.guardianName !== undefined) updateData.guardianName = data.guardianName;
    if (data.guardianPhone !== undefined) updateData.guardianPhone = data.guardianPhone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup;
    if (data.enrollmentNumber !== undefined) updateData.enrollmentNumber = data.enrollmentNumber;
    if (data.course !== undefined) updateData.course = data.course;
    if (data.year !== undefined) updateData.year = data.year;

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: updateData,
    });

    return profile;
  }

  static async getStudentWithAllocation(userId: string, tenantId: string) {
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        roomAllocations: {
          where: { status: "ACTIVE" },
          include: {
            room: {
              select: {
                id: true,
                roomNumber: true,
                floor: true,
                roomType: true,
              },
            },
          },
        },
      },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new Error("Student not found");
    }

    return student;
  }
}