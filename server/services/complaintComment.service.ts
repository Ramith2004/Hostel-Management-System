import { PrismaClient, type ComplaintComment } from "@prisma/client";
import type { CreateComplaintCommentDTO } from "../types/complaintComment.type.ts";
import type { ComplaintCommentResponse } from "../types/complaintComment.type.ts";

const prisma = new PrismaClient();

export class ComplaintCommentService {
  // Add comment to complaint
  async addComment(data: CreateComplaintCommentDTO): Promise<ComplaintComment> {
    return prisma.complaintComment.create({
      data: {
        complaintId: data.complaintId,
        userId: data.userId,
        comment: data.comment,
        isInternal: data.isInternal || false,
        attachmentUrl: data.attachmentUrl ?? null,
        commentType: data.commentType || "COMMENT",
      },
    });
  }

  // Get all comments for a complaint
  async getCommentsByComplaintId(complaintId: string): Promise<ComplaintCommentResponse[]> {
    const comments = await prisma.complaintComment.findMany({
      where: { complaintId },
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
        createdAt: "asc",
      },
    });

    return comments.map(comment => ({
      ...comment,
      attachmentUrl: comment.attachmentUrl ?? "",
      commentType: comment.commentType ?? "COMMENT",
    }));
  }

  // Get visible comments (for students, exclude internal comments)
  async getVisibleComments(complaintId: string, isStudent: boolean): Promise<ComplaintCommentResponse[]> {
    const whereClause: any = {
      complaintId,
    };

    if (isStudent) {
      whereClause.isInternal = false;
    }

    const comments = await prisma.complaintComment.findMany({
      where: whereClause,
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
        createdAt: "asc",
      },
    });

    return comments.map(comment => ({
      ...comment,
      attachmentUrl: comment.attachmentUrl ?? "",
      commentType: comment.commentType ?? "COMMENT",
    }));
  }

  // Update comment
  async updateComment(commentId: string, comment: string): Promise<ComplaintComment> {
    return prisma.complaintComment.update({
      where: { id: commentId },
      data: {
        comment,
        updatedAt: new Date(),
      },
    });
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<ComplaintComment> {
    return prisma.complaintComment.delete({
      where: { id: commentId },
    });
  }

  // Get recent comments
  async getRecentComments(complaintId: string, limit = 5): Promise<ComplaintCommentResponse[]> {
    const comments = await prisma.complaintComment.findMany({
      where: { complaintId },
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
        createdAt: "desc",
      },
      take: limit,
    });

    return comments.map(comment => ({
      ...comment,
      attachmentUrl: comment.attachmentUrl ?? "",
      commentType: comment.commentType ?? "COMMENT",
    }));
  }
}

export const complaintCommentService = new ComplaintCommentService();