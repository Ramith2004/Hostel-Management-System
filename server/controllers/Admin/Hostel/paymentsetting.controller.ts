import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Get fee settings for a tenant
export const getFeeSettings = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    // ✅ FIXED: Get the latest active fee structure for this tenant
    const feeSettings = await prisma.feeStructure.findFirst({
      where: {
        tenantId,
        effectiveTo: null, // Only get active fee structures
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    if (!feeSettings) {
      // ✅ FIXED: Return default values instead of 404
      return res.status(200).json({
        success: true,
        message: 'No fee structure found. Using default values.',
        data: {
          id: null,
          monthlyFee: 5000, // ✅ Default fee
          effectiveFrom: new Date().toISOString().split('T')[0],
          totalMonthlyFee: 5000,
          electricityCharge: 0,
          waterCharge: 0,
          maintenanceCharge: 0,
          wifiCharge: 0,
          otherCharges: 0,
          roomType: 'ALL',
          isDefault: true, // ✅ Flag to indicate this is a default
        },
      });
    }

    // ✅ Convert Decimal to number for response
    return res.status(200).json({
      success: true,
      message: 'Fee settings fetched successfully',
      data: {
        id: feeSettings.id,
        monthlyFee: Number(feeSettings.baseFee),
        effectiveFrom: feeSettings.effectiveFrom.toISOString().split('T')[0],
        totalMonthlyFee: Number(feeSettings.totalMonthlyFee),
        electricityCharge: Number(feeSettings.electricityCharge),
        waterCharge: Number(feeSettings.waterCharge),
        maintenanceCharge: Number(feeSettings.maintenanceCharge),
        wifiCharge: Number(feeSettings.wifiCharge),
        otherCharges: Number(feeSettings.otherCharges),
        roomType: feeSettings.roomType,
        isDefault: false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching fee settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fee settings',
    });
  }
};

// ✅ NEW: Create initial fee settings for a tenant
export const createInitialFeeSettings = async (req: Request, res: Response) => {
  try {
    const {
      monthlyFee,
      effectiveFrom,
      electricityCharge = 0,
      waterCharge = 0,
      maintenanceCharge = 0,
      wifiCharge = 0,
      otherCharges = 0,
    } = req.body;

    const tenantId = req.headers['x-tenant-id'] as string;

    // ✅ Validation
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    if (!monthlyFee || monthlyFee <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid monthly fee is required and must be greater than 0',
      });
    }

    if (!effectiveFrom) {
      return res.status(400).json({
        success: false,
        message: 'Effective from date is required',
      });
    }

    // Check if fee structure already exists
    const existingFeeStructure = await prisma.feeStructure.findFirst({
      where: {
        tenantId,
        effectiveTo: null,
      },
    });

    if (existingFeeStructure) {
      return res.status(400).json({
        success: false,
        message: 'Fee structure already exists for this tenant. Use update endpoint instead.',
      });
    }

    // ✅ Get all rooms for this tenant
    const rooms = await prisma.room.findMany({
      where: { tenantId },
      select: { id: true, roomType: true },
    });

    if (rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms found for this tenant. Please create rooms first.',
      });
    }

    // ✅ Calculate total monthly fee
    const totalMonthlyFee = new Decimal(monthlyFee)
      .plus(new Decimal(electricityCharge || 0))
      .plus(new Decimal(waterCharge || 0))
      .plus(new Decimal(maintenanceCharge || 0))
      .plus(new Decimal(wifiCharge || 0))
      .plus(new Decimal(otherCharges || 0));

    // ✅ Create fee structures for all rooms
    const createdFeeStructures = await Promise.all(
      rooms.map((room) =>
        prisma.feeStructure.create({
          data: {
            tenantId,
            roomId: room.id,
            roomType: room.roomType,
            baseFee: new Decimal(monthlyFee),
            electricityCharge: new Decimal(electricityCharge || 0),
            waterCharge: new Decimal(waterCharge || 0),
            maintenanceCharge: new Decimal(maintenanceCharge || 0),
            wifiCharge: new Decimal(wifiCharge || 0),
            otherCharges: new Decimal(otherCharges || 0),
            totalMonthlyFee,
            effectiveFrom: new Date(effectiveFrom),
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Initial fee settings created successfully for ${createdFeeStructures.length} rooms`,
      data: {
        id: createdFeeStructures[0]?.id ?? null,
        monthlyFee: Number(monthlyFee),
        effectiveFrom: effectiveFrom,
        totalMonthlyFee: Number(totalMonthlyFee),
        electricityCharge: Number(electricityCharge || 0),
        waterCharge: Number(waterCharge || 0),
        maintenanceCharge: Number(maintenanceCharge || 0),
        wifiCharge: Number(wifiCharge || 0),
        otherCharges: Number(otherCharges || 0),
        roomsCreated: createdFeeStructures.length,
      },
    });
  } catch (error: any) {
    console.error('Error creating initial fee settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create fee settings',
    });
  }
};

// Update fee settings for a tenant
export const updateFeeSettings = async (req: Request, res: Response) => {
  try {
    const {
      monthlyFee,
      effectiveFrom,
      electricityCharge = 0,
      waterCharge = 0,
      maintenanceCharge = 0,
      wifiCharge = 0,
      otherCharges = 0,
    } = req.body;

    const tenantId = req.headers['x-tenant-id'] as string;

    // ✅ Validation
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    if (!monthlyFee || monthlyFee <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid monthly fee is required and must be greater than 0',
      });
    }

    if (!effectiveFrom) {
      return res.status(400).json({
        success: false,
        message: 'Effective from date is required',
      });
    }

    // Validate date is not in the past
    const effectiveDate = new Date(effectiveFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (effectiveDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Effective date cannot be in the past',
      });
    }

    // ✅ Get all rooms for this tenant
    const rooms = await prisma.room.findMany({
      where: { tenantId },
      select: { id: true, roomType: true },
    });

    if (rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms found for this tenant',
      });
    }

    // ✅ Calculate total monthly fee
    const totalMonthlyFee = new Decimal(monthlyFee)
      .plus(new Decimal(electricityCharge || 0))
      .plus(new Decimal(waterCharge || 0))
      .plus(new Decimal(maintenanceCharge || 0))
      .plus(new Decimal(wifiCharge || 0))
      .plus(new Decimal(otherCharges || 0));

    // ✅ Mark existing fee structures as expired
    await prisma.feeStructure.updateMany({
      where: {
        tenantId,
        effectiveTo: null,
      },
      data: {
        effectiveTo: effectiveDate,
      },
    });

    // ✅ Update or create fee structures for all rooms
    let updatedCount = 0;

    for (const room of rooms) {
      // Check if fee structure exists for this room
      const existingFeeStructure = await prisma.feeStructure.findUnique({
        where: { roomId: room.id },
      });

      if (existingFeeStructure) {
        // Update existing fee structure
        await prisma.feeStructure.update({
          where: { roomId: room.id },
          data: {
            baseFee: new Decimal(monthlyFee),
            electricityCharge: new Decimal(electricityCharge || 0),
            waterCharge: new Decimal(waterCharge || 0),
            maintenanceCharge: new Decimal(maintenanceCharge || 0),
            wifiCharge: new Decimal(wifiCharge || 0),
            otherCharges: new Decimal(otherCharges || 0),
            totalMonthlyFee,
            effectiveFrom: effectiveDate,
            effectiveTo: null, // Clear the effective-to date
          },
        });
      } else {
        // Create new fee structure if it doesn't exist
        await prisma.feeStructure.create({
          data: {
            tenantId,
            roomId: room.id,
            roomType: room.roomType,
            baseFee: new Decimal(monthlyFee),
            electricityCharge: new Decimal(electricityCharge || 0),
            waterCharge: new Decimal(waterCharge || 0),
            maintenanceCharge: new Decimal(maintenanceCharge || 0),
            wifiCharge: new Decimal(wifiCharge || 0),
            otherCharges: new Decimal(otherCharges || 0),
            totalMonthlyFee,
            effectiveFrom: effectiveDate,
          },
        });
      }
      updatedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Fee settings updated successfully for ${updatedCount} rooms`,
      data: {
        id: 'new-fee-structure',
        monthlyFee: Number(monthlyFee),
        effectiveFrom: effectiveFrom,
        totalMonthlyFee: Number(totalMonthlyFee),
        electricityCharge: Number(electricityCharge || 0),
        waterCharge: Number(waterCharge || 0),
        maintenanceCharge: Number(maintenanceCharge || 0),
        wifiCharge: Number(wifiCharge || 0),
        otherCharges: Number(otherCharges || 0),
        roomsUpdated: updatedCount,
      },
    });
  } catch (error: any) {
    console.error('Error updating fee settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update fee settings',
    });
  }
};