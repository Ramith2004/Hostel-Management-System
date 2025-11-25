import type { Request, Response } from "express";
import { complaintService } from "../../services/complaint.service.ts";

export class StudentComplaintController {
  async getMyComplaints(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const {
        page = "1",
        limit = "10",
        status,
        priority,
        category,
        startDate,
        endDate,
      } = req.query;

      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!tenantId || typeof tenantId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid tenantId",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      // Build filter params with proper typing
      const filters: any = {
        page: pageNum,
        limit: limitNum,
        studentId: userId,
      };

      // Add filters - ensure they're strings and not "ALL"
      if (status && String(status).toUpperCase() !== "ALL" && status !== "") {
        filters.status = String(status).toUpperCase();
        console.log("Controller: Status filter =", filters.status);
      }

      if (priority && String(priority).toUpperCase() !== "ALL" && priority !== "") {
        filters.priority = String(priority).toUpperCase();
        console.log("Controller: Priority filter =", filters.priority);
      }

      if (category && String(category).toUpperCase() !== "ALL" && category !== "") {
        filters.category = String(category).toUpperCase();
        console.log("Controller: Category filter =", filters.category);
      }

      if (startDate) {
        filters.startDate = startDate as string;
      }

      if (endDate) {
        filters.endDate = endDate as string;
      }

      console.log("=== CONTROLLER FILTERS ===");
      console.log(JSON.stringify(filters, null, 2));
      console.log("========================");

      // Use the service method
      const result = await complaintService.getComplaints(tenantId, filters);

      console.log(`=== CONTROLLER RESPONSE ===`);
      console.log(`Returning ${result.data.length} complaints`);
      console.log("=========================");

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("=== CONTROLLER ERROR ===");
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaints",
        error: error.message,
      });
    }
  }

  // ... rest of the methods remain the same
  async submitComplaint(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const { title, description, category, priority, roomId, attachmentUrl } = req.body;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!tenantId || typeof tenantId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid tenantId",
        });
      }

      if (!title || !description || !category || !priority) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, description, category, and priority are required",
        });
      }

      const complaintData = {
        studentId: userId,
        title,
        description,
        category,
        priority,
        roomId: roomId || undefined,
        attachmentUrl: attachmentUrl || undefined,
      };

      const complaint = await complaintService.createComplaint(tenantId, complaintData);

      res.status(201).json({
        success: true,
        data: complaint,
        message: "Complaint submitted successfully",
      });
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit complaint",
        error: error.message,
      });
    }
  }

  async getComplaintDetail(req: Request, res: Response) {
    try {
      const { tenantId, complaintId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!complaintId || typeof complaintId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid complaintId",
        });
      }

      if (!tenantId || typeof tenantId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid tenantId",
        });
      }

      const complaint = await complaintService.getComplaintById(complaintId, tenantId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      if (complaint.studentId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You can only view your own complaints",
        });
      }

      res.json({
        success: true,
        data: complaint,
      });
    } catch (error: any) {
      console.error("Error fetching complaint details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaint details",
        error: error.message,
      });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { tenantId, complaintId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!complaintId || typeof complaintId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid complaintId",
        });
      }

      if (!tenantId || typeof tenantId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid tenantId",
        });
      }

      const complaint = await complaintService.getComplaintById(complaintId, tenantId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      if (complaint.studentId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: complaint.comments || [],
      });
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch comments",
        error: error.message,
      });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const { tenantId, complaintId } = req.params;
      const { comment, attachmentUrl } = req.body;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!complaintId || typeof complaintId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid complaintId",
        });
      }

      if (!tenantId || typeof tenantId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid tenantId",
        });
      }

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty",
        });
      }

      const complaint = await complaintService.getComplaintById(complaintId, tenantId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      if (complaint.studentId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const prisma = complaintService.prisma;

      const newComment = await prisma.complaintComment.create({
        data: {
          complaintId,
          userId,
          comment: comment.trim(),
          attachmentUrl: attachmentUrl || null,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: newComment,
        message: "Comment added successfully",
      });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add comment",
        error: error.message,
      });
    }
  }
}

export const studentComplaintController = new StudentComplaintController();