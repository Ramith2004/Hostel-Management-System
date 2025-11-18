import type { Request, Response, NextFunction } from "express";
import  prisma  from "../utils/prisma.ts";

export const verifyTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    if (tenant.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Tenant account is suspended",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tenant verification failed",
      error,
    });
  }
};