import type { Request, Response } from 'express';
import { TenantStatus } from '@prisma/client';
import prisma from '../../utils/prisma.ts';
import { z } from 'zod';

// Validation schemas
const organizationSchema = z.object({
  hostelName: z.string().min(3, 'Hostel name must be at least 3 characters'),
  hostelAddress: z.string().min(5, 'Address is required'),
  hostelPhone: z.string().min(10, 'Valid phone number required'),
  hostelEmail: z.string().email('Valid email required'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(),
  description: z.string().optional(),
});

const adminProfileSchema = z.object({
  gstNumber: z.string().optional(),
  businessLicense: z.string().optional(),
});

// Step 2: Add Organization Details
export const addOrganizationDetails = async (req: Request, res: Response) => {
  try {
    const data = organizationSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if hostel name already exists (excluding current tenant)
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        name: data.hostelName,
        id: { not: tenantId }
      }
    });

    if (existingTenant) {
      return res.status(400).json({ message: 'Hostel name already taken' });
    }

    // Generate slug from hostel name
    const slug = data.hostelName.toLowerCase().replace(/\s+/g, '-');

    // Update tenant with organization details
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.hostelName,
        slug,
        address: data.hostelAddress,
        phone: data.hostelPhone,
        email: data.hostelEmail,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        website: data.website || null,
        logo: data.logo || null,
        description: data.description || null,
      }
    });

    res.status(200).json({
      message: 'Organization details saved successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      },
      step: 2
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues });
    }
    res.status(500).json({ message: 'Failed to save organization details', error: err.message });
  }
};

// Step 2.5: Add Admin Profile Details
export const addAdminProfileDetails = async (req: Request, res: Response) => {
  try {
    const data = adminProfileSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get tenant details
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Create or update admin profile
    const adminProfile = await prisma.adminProfile.upsert({
      where: { userId },
      update: {
        gstNumber: data.gstNumber || null,
        businessLicense: data.businessLicense || null,
      },
      create: {
        userId,
        tenantId,
        hostelName: tenant.name,
        hostelAddress: tenant.address || '',
        hostelPhone: tenant.phone || '',
        hostelEmail: tenant.email || '',
        gstNumber: data.gstNumber || null,
        businessLicense: data.businessLicense || null,
      }
    });

    res.status(200).json({
      message: 'Admin profile details saved successfully',
      adminProfile: {
        id: adminProfile.id,
        gstNumber: adminProfile.gstNumber,
        businessLicense: adminProfile.businessLicense
      },
      step: 2.5
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues });
    }
    res.status(500).json({ message: 'Failed to save admin profile', error: err.message });
  }
};

// Step 3: Process Payment (Placeholder)
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userId = (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate payment (integrate with payment gateway later)
    if (!planId || !paymentMethod) {
      return res.status(400).json({ message: 'Plan and payment method required' });
    }

    // Update tenant status to TRIAL
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan: planId,
        status: TenantStatus.TRIAL,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      }
    });

    res.status(200).json({
      message: 'Payment processed successfully',
      tenant: {
        id: tenant.id,
        subscriptionPlan: tenant.subscriptionPlan,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt
      },
      step: 3
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Payment processing failed', error: err.message });
  }
};

// Step 4: Complete Onboarding
export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Update tenant status to ACTIVE
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: TenantStatus.ACTIVE,
      }
    });

    // Get user and tenant info
    const user = await prisma.user.findUnique({ where: { id: userId } });

    res.status(200).json({
      message: 'Onboarding completed successfully!',
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
        subscriptionPlan: tenant.subscriptionPlan
      },
      step: 4
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to complete onboarding', error: err.message });
  }
};