import type { Request, Response } from 'express';
import { UserRole, UserStatus, TenantStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../../types/auth.type.ts';
import { z } from 'zod';
import prisma from '../../utils/prisma.ts';

// Step 1: Register Admin User Only
export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user with same email exists
    const existingUser = await prisma.user.findFirst({ 
      where: { email: data.email } 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create temporary tenant (INACTIVE status)
    const tenant = await prisma.tenant.create({
      data: {
        name: `Temp-${Date.now()}`, // Temporary name
        slug: `temp-${Date.now()}`,
        status: TenantStatus.INACTIVE,
      }
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        tenantId: tenant.id,
      }
    });

    // Generate temporary token for onboarding
    const token = jwt.sign(
      { userId: user.id, role: user.role, tenantId: tenant.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful. Please complete onboarding.',
      token,
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: tenant.id },
      step: 1
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues });
    }
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findFirst({ 
      where: { email: data.email } 
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId 
      } 
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues });
    }
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};