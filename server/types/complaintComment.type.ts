export interface CreateComplaintCommentDTO {
  complaintId: string;
  userId: string;
  comment: string;
  isInternal?: boolean;
  attachmentUrl?: string | null;
  commentType?: "COMMENT" | "STATUS_UPDATE" | "RESOLUTION";
}

export interface ComplaintCommentResponse {
  id: string;
  complaintId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  attachmentUrl: string | null;
  commentType: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}