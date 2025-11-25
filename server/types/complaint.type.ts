import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@prisma/client";
import type { ComplaintCommentResponse } from "./complaintComment.type.ts";

export interface CreateComplaintDTO {
  studentId: string;
roomId?: string | null;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority?: ComplaintPriority | undefined;
  attachmentUrl?: string | null | undefined;
}

export interface UpdateComplaintDTO {
  title?: string;
  description?: string;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  attachmentUrl?: string | null;
}

export interface ResolveComplaintDTO {
  status: ComplaintStatus;
  resolutionNotes: string;
  resolvedBy: string; // User ID
}

export interface ComplaintFilterParams {
  status?: ComplaintStatus | undefined;
  priority?: ComplaintPriority | undefined;
  category?: ComplaintCategory | undefined;
  studentId?: string | undefined;
  roomId?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ComplaintResponse {
  id: string;
  tenantId: string;
  studentId: string;
  roomId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  attachmentUrl?: string | null;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    floor: string;
  };
  comments?: ComplaintCommentResponse[];
}

export interface ComplaintStats {
  total: number;
  pending: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
  averageResolutionTime?: number;
}