import { z } from "zod";
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@prisma/client";

export const createComplaintSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  roomId: z.string().uuid("Invalid room ID").nullable().optional(), // <-- changed line
  category: z.enum([
    "MAINTENANCE",
    "ELECTRICAL",
    "PLUMBING",
    "HOUSEKEEPING",
    "INTERNET",
    "FURNITURE",
    "SAFETY",
    "HYGIENE",
    "NOISE",
    "OTHER",
  ] as const),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const)
    .optional()
    .default("MEDIUM"),
  attachmentUrl: z.string().url().nullable().optional(),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).optional(),
  status: z
    .enum(["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as const)
    .optional(),
  attachmentUrl: z.string().url().nullable().optional(),
});

export const resolveComplaintSchema = z.object({
  status: z.enum(["RESOLVED", "CLOSED", "REJECTED"] as const),
  resolutionNotes: z.string().min(10, "Resolution notes must be at least 10 characters").max(2000),
  resolvedBy: z.string().uuid("Invalid user ID"),
});

export const complaintFilterSchema = z.object({
  status: z
    .enum(["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as const)
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).optional(),
  category: z
    .enum([
      "MAINTENANCE",
      "ELECTRICAL",
      "PLUMBING",
      "HOUSEKEEPING",
      "INTERNET",
      "FURNITURE",
      "SAFETY",
      "HYGIENE",
      "NOISE",
      "OTHER",
    ] as const)
    .optional(),
  studentId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const createCommentSchema = z.object({
  complaintId: z.string().uuid("Invalid complaint ID"),
  userId: z.string().uuid("Invalid user ID"),
  comment: z.string().min(1, "Comment cannot be empty").max(1000),
  isInternal: z.boolean().optional().default(false),
  attachmentUrl: z.string().url().nullable().optional(),
  commentType: z.enum(["COMMENT", "STATUS_UPDATE", "RESOLUTION"]).optional().default("COMMENT"),
}).strict(); // Add .strict() to prevent extra properties