export interface CreateEventDTO {
  title: string;
  description: string;
  eventDate: Date | string;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  eventDate?: Date | string;
  location?: string;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED";
}

export interface EventResponse {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventFilterParams {
  tenantId: string;
  status?: string;
  page?: number;
  limit?: number;
}