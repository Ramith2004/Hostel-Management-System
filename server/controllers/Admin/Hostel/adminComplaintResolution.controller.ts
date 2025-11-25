import type { Request, Response } from 'express';
import { PrismaClient, ComplaintStatus } from '@prisma/client';
import { complaintFilterSchema, createCommentSchema, resolveComplaintSchema } from '../../../utils/complaint-validator.ts';
import { z } from 'zod';

const prisma = new PrismaClient();

class AdminComplaintResolutionController {
  // Get all complaints with filters
  async getAllComplaints(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }
      const tenantId = req.user.tenantId;

      // Convert page and limit to numbers explicitly
      const filters = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      console.log("🔵 Admin Controller - Filters:", JSON.stringify(filters, null, 2));

      // Validate filters
      const validatedFilters = complaintFilterSchema.parse(filters);

      const { status, priority, category, page, limit } = validatedFilters;
      const skip = (page - 1) * limit;

      const where: any = { tenantId };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;

      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where,
          include: {
            student: { select: { id: true, name: true, email: true, phone: true } },
            room: {
              select: {
                id: true,
                roomNumber: true,
                roomName: true,
                building: { select: { id: true, buildingName: true } },
                floor: { select: { id: true, floorNumber: true } },
              },
            },
            comments: { 
              include: { 
                user: { select: { id: true, name: true, role: true } } 
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.complaint.count({ where }),
      ]);

      console.log(`🟢 Returning ${complaints.length} complaints out of ${total} total`);

      return res.status(200).json({
        success: true,
        message: 'Complaints retrieved successfully',
        data: complaints,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('🔴 Controller Error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      }

      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch complaints',
        data: null 
      });
    }
  }

  // Get complaint statistics
  async getComplaintStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }
      const tenantId = req.user.tenantId;

      console.log("🔵 Getting complaint stats for tenant:", tenantId);

      const [
        total,
        pending,
        acknowledged,
        inProgress,
        resolved,
        closed,
        rejected
      ] = await Promise.all([
        prisma.complaint.count({ where: { tenantId } }),
        prisma.complaint.count({ where: { tenantId, status: 'PENDING' } }),
        prisma.complaint.count({ where: { tenantId, status: 'ACKNOWLEDGED' } }),
        prisma.complaint.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
        prisma.complaint.count({ where: { tenantId, status: 'RESOLVED' } }),
        prisma.complaint.count({ where: { tenantId, status: 'CLOSED' } }),
        prisma.complaint.count({ where: { tenantId, status: 'REJECTED' } }),
      ]);

      // Calculate average resolution time
      const resolvedComplaints = await prisma.complaint.findMany({
        where: {
          tenantId,
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      });

      let averageResolutionTime = 0;
      if (resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((sum, complaint) => {
          if (complaint.resolvedAt) {
            const time = complaint.resolvedAt.getTime() - complaint.createdAt.getTime();
            return sum + time;
          }
          return sum;
        }, 0);
        averageResolutionTime = totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      const stats = {
        total,
        pending,
        acknowledged,
        inProgress,
        resolved,
        closed,
        rejected,
        averageResolutionTime: Math.round(averageResolutionTime * 10) / 10, // Round to 1 decimal
      };

      console.log("🟢 Complaint stats:", stats);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('🔴 Error fetching stats:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch stats' 
      });
    }
  }

  // Get complaints grouped by category
  async getComplaintsByCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }
      const tenantId = req.user.tenantId;

      console.log("🔵 Getting complaints by category for tenant:", tenantId);

      const complaints = await prisma.complaint.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: { category: true },
      });

      const categoryData = complaints.map(item => ({
        category: item.category,
        count: item._count.category,
      }));

      console.log("🟢 Category data:", categoryData);

      return res.status(200).json({
        success: true,
        data: categoryData,
      });
    } catch (error: any) {
      console.error('🔴 Error fetching complaints by category:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch complaints by category' 
      });
    }
  }

  // Generate complaint report with date range
  async getComplaintReport(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }
      const tenantId = req.user.tenantId;
      const { startDate, endDate } = req.query;

      console.log("🔵 Generating complaint report:", { tenantId, startDate, endDate });

      const where: any = { tenantId };
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          // Set to end of day
          const endDateTime = new Date(endDate as string);
          endDateTime.setHours(23, 59, 59, 999);
          where.createdAt.lte = endDateTime;
        }
      }

      const complaints = await prisma.complaint.findMany({
        where,
        include: {
          student: { 
            select: { 
              id: true,
              name: true, 
              email: true,
              phone: true,
            } 
          },
          room: { 
            select: { 
              id: true,
              roomNumber: true,
              roomName: true,
              building: { select: { buildingName: true } },
              floor: { select: { floorNumber: true } },
            } 
          },
          resolvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`🟢 Report generated with ${complaints.length} complaints`);

      return res.status(200).json({
        success: true,
        data: {
          data: complaints,
          count: complaints.length,
        },
      });
    } catch (error: any) {
      console.error('🔴 Error fetching complaint report:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch complaint report' 
      });
    }
  }

  // Get single complaint detail
  async getComplaintDetail(req: Request, res: Response) {
    try {
      const { complaintId } = req.params;
      
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }
      const tenantId = req.user.tenantId;

      if (!complaintId) {
        return res.status(400).json({ success: false, message: 'complaintId is required' });
      }

      console.log("🔵 Getting complaint detail:", { tenantId, complaintId });

      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId as string },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomName: true,
              floor: {
                select: {
                  id: true,
                  floorNumber: true,
                },
              },
              building: {
                select: {
                  id: true,
                  buildingName: true,
                },
              },
            },
          },
          resolvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
        });
      }

      // Verify tenant access
      if (complaint.tenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot access this complaint',
        });
      }

      console.log("🟢 Complaint detail retrieved");

      return res.status(200).json({
        success: true,
        data: complaint,
      });
    } catch (error: any) {
      console.error('🔴 Error fetching complaint detail:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch complaint detail' 
      });
    }
  }

  // Update complaint status
  async updateComplaintStatus(req: Request, res: Response) {
    try {
      const { complaintId } = req.params;
      const { status } = req.body;

      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: tenantId missing' });
      }

      if (!complaintId) {
        return res.status(400).json({ success: false, message: 'complaintId is required' });
      }

      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required' });
      }

      console.log("🔵 Updating complaint status:", { complaintId, status });

      // Validate status
      const validStatuses: ComplaintStatus[] = [
        'PENDING', 
        'ACKNOWLEDGED', 
        'IN_PROGRESS', 
        'RESOLVED', 
        'CLOSED', 
        'REJECTED'
      ];
      
      if (!validStatuses.includes(status as ComplaintStatus)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }

      const updateData: any = { status: status as ComplaintStatus };
      
      // Auto-set resolvedAt if status is RESOLVED or CLOSED
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
        if (req.user.userId) {
          updateData.resolvedBy = req.user.userId;
        }
      }

      const complaint = await prisma.complaint.update({
        where: { id: complaintId as string },
        data: updateData,
        include: {
          student: { select: { id: true, name: true, email: true } },
          room: { select: { id: true, roomNumber: true } },
          resolvedByUser: { select: { id: true, name: true } },
        },
      });

      console.log("🟢 Complaint status updated");

      return res.status(200).json({ 
        success: true, 
        data: complaint,
        message: 'Complaint status updated successfully',
      });
    } catch (error: any) {
      console.error('🔴 Error updating complaint:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to update complaint' 
      });
    }
  }

  // Resolve complaint with notes
  async resolveComplaint(req: Request, res: Response) {
    try {
      const { complaintId } = req.params;
      const { status, resolutionNotes } = req.body;

      if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
      }

      if (!complaintId || typeof complaintId !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid complaintId is required' });
      }

      console.log("🔵 Resolving complaint:", { complaintId, status, resolutionNotes });

      const validatedData = resolveComplaintSchema.parse({
        status,
        resolutionNotes,
        resolvedBy: req.user.userId,
      });

      const complaint = await prisma.complaint.update({
        where: { id: complaintId as string },
        data: {
          status: validatedData.status,
          resolutionNotes: validatedData.resolutionNotes,
          resolvedBy: validatedData.resolvedBy,
          resolvedAt: new Date(),
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          room: { select: { id: true, roomNumber: true } },
          resolvedByUser: { select: { id: true, name: true } },
        },
      });

      console.log("🟢 Complaint resolved successfully");

      return res.status(200).json({ 
        success: true, 
        data: complaint,
        message: 'Complaint resolved successfully',
      });
    } catch (error: any) {
      console.error('🔴 Error resolving complaint:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }

      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to resolve complaint' 
      });
    }
  }

  // Add comment to complaint
  async addComment(req: Request, res: Response) {
    try {
      const { complaintId } = req.params;
      const { comment, isInternal, attachmentUrl } = req.body;

      if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
      }

      if (!complaintId) {
        return res.status(400).json({ success: false, message: 'complaintId is required' });
      }

      console.log("🔵 Adding comment:", { complaintId, userId: req.user.userId });

      const validatedData = createCommentSchema.parse({
        complaintId,
        userId: req.user.userId,
        comment,
        isInternal: isInternal || false,
        attachmentUrl: typeof attachmentUrl === 'undefined' ? null : attachmentUrl,
        commentType: 'COMMENT',
      });

      // Ensure attachmentUrl is never undefined
      const safeAttachmentUrl: string | null = validatedData.attachmentUrl === undefined ? null : validatedData.attachmentUrl;

      const newComment = await prisma.complaintComment.create({
        data: {
          complaintId: validatedData.complaintId,
          userId: validatedData.userId,
          comment: validatedData.comment,
          isInternal: validatedData.isInternal,
          attachmentUrl: safeAttachmentUrl,
          commentType: validatedData.commentType,
        },
        include: {
          user: { 
            select: { 
              id: true,
              name: true, 
              role: true,
              email: true,
            } 
          },
        },
      });

      console.log("🟢 Comment added successfully");

      return res.status(201).json({ 
        success: true, 
        data: newComment,
        message: 'Comment added successfully',
      });
    } catch (error: any) {
      console.error('🔴 Error adding comment:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }

      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to add comment' 
      });
    }
  }

  // Get all comments for a complaint
  async getComments(req: Request, res: Response) {
    try {
      const { complaintId } = req.params;

      if (!complaintId) {
        return res.status(400).json({ success: false, message: 'complaintId is required' });
      }

      console.log("🔵 Getting comments for complaint:", complaintId);

      const comments = await prisma.complaintComment.findMany({
        where: { complaintId: complaintId as string },
        include: {
          user: { 
            select: { 
              id: true,
              name: true, 
              role: true, 
              email: true,
            } 
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`🟢 Retrieved ${comments.length} comments`);

      return res.status(200).json({ 
        success: true, 
        data: comments 
      });
    } catch (error: any) {
      console.error('🔴 Error fetching comments:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch comments' 
      });
    }
  }
}

export const adminComplaintResolutionController = new AdminComplaintResolutionController();