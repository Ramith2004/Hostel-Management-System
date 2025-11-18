import type { Request, Response } from "express";
import { DashboardService } from "../../services/dashboard.service.ts";

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const metrics = await DashboardService.getDashboardMetrics(
      req.user.tenantId
    );

    res.status(200).json({
      success: true,
      message: "Dashboard metrics retrieved successfully",
      data: metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOccupancyTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const months = req.query.months ? parseInt(req.query.months as string) : 12;

    const trend = await DashboardService.getOccupancyTrend(
      req.user.tenantId,
      months
    );

    res.status(200).json({
      success: true,
      message: "Occupancy trend retrieved successfully",
      data: trend,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaintTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const trend = await DashboardService.getComplaintTrend(
      req.user.tenantId,
      days
    );

    res.status(200).json({
      success: true,
      message: "Complaint trend retrieved successfully",
      data: trend,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};