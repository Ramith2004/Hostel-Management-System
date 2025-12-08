import api, { API_ROUTES } from "./api";

export interface Event {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateEventPayload {
  title: string;
  description: string;
  eventDate: string | Date;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  eventDate?: string | Date;
  location?: string;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED";
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: Event | Event[];
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

// Admin Event Services
export const adminEventService = {
  // Create Event
  createEvent: async (payload: CreateEventPayload): Promise<Event> => {
    try {
      const response = await api.post<EventResponse>(
        API_ROUTES.ADMIN_EVENTS_CREATE,
        payload
      );
      return response.data.data as Event;
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to create event";
    }
  },

  // Get All Events (Admin History)
  getEvents: async (page: number = 1, limit: number = 10): Promise<{
    events: Event[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      limit: number;
    };
  }> => {
    try {
      const response = await api.get<EventResponse>(
        `${API_ROUTES.ADMIN_EVENTS_LIST}?page=${page}&limit=${limit}`
      );
      return {
        events: response.data.data as Event[],
        pagination: response.data.pagination || {
          total: 0,
          pages: 0,
          currentPage: page,
          limit,
        },
      };
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to fetch events";
    }
  },

  // Get Event by ID
  getEventById: async (id: string): Promise<Event> => {
    try {
      const response = await api.get<EventResponse>(
        API_ROUTES.ADMIN_EVENTS_DETAIL(id)
      );
      return response.data.data as Event;
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to fetch event";
    }
  },

  // Update Event
  updateEvent: async (id: string, payload: UpdateEventPayload): Promise<Event> => {
    try {
      const response = await api.put<EventResponse>(
        API_ROUTES.ADMIN_EVENTS_UPDATE(id),
        payload
      );
      return response.data.data as Event;
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to update event";
    }
  },

  // Delete Event
  deleteEvent: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.ADMIN_EVENTS_DELETE(id));
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to delete event";
    }
  },
};

// Student Event Services
export const studentEventService = {
  // Get Published Events (Student)
  getPublishedEvents: async (page: number = 1, limit: number = 10): Promise<{
    events: Event[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      limit: number;
    };
  }> => {
    try {
      const response = await api.get<EventResponse>(
        `${API_ROUTES.STUDENT_EVENTS_PUBLISHED}?page=${page}&limit=${limit}`
      );
      return {
        events: response.data.data as Event[],
        pagination: response.data.pagination || {
          total: 0,
          pages: 0,
          currentPage: page,
          limit,
        },
      };
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to fetch published events";
    }
  },
};