import prisma from "../utils/prisma.ts";
import type { CreateEventDTO, UpdateEventDTO, EventResponse } from "../types/event.type.ts";

export const eventService = {
  // Create event
  async createEvent(
    tenantId: string,
    createdBy: string,
    data: CreateEventDTO
  ): Promise<EventResponse> {
    try {
      const event = await prisma.event.create({
        data: {
          tenantId,
          createdBy,
          title: data.title,
          description: data.description,
          eventDate: new Date(data.eventDate),
          location: data.location,
          status: data.status,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return formatEventResponse(event);
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  },

  // Get all events for admin (sorted by createdAt DESC)
  async getEvents(
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ events: EventResponse[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: { tenantId },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.event.count({ where: { tenantId } }),
      ]);

      return {
        events: events.map(formatEventResponse),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to fetch events");
    }
  },

  // Get published events for students (sorted by eventDate ASC, hide past events)
  async getPublishedEvents(
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ events: EventResponse[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // ✅ Set time to start of day for accurate comparison
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      console.log("Fetching published events for tenant:", tenantId);
      console.log("Current date filter:", now);

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: {
            tenantId,
            status: "PUBLISHED",
            eventDate: {
              gte: now,
            },
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            eventDate: "asc",
          },
          skip,
          take: limit,
        }),
        prisma.event.count({
          where: {
            tenantId,
            status: "PUBLISHED",
            eventDate: {
              gte: now,
            },
          },
        }),
      ]);

      console.log("Found published events:", events.length);

      return {
        events: events.map(formatEventResponse),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching published events:", error);
      throw new Error("Failed to fetch published events");
    }
  },

  // Get event by ID
  async getEventById(
    eventId: string,
    tenantId: string
  ): Promise<EventResponse | null> {
    try {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          tenantId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return event ? formatEventResponse(event) : null;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw new Error("Failed to fetch event");
    }
  },

  // Update event
  async updateEvent(
    eventId: string,
    tenantId: string,
    data: UpdateEventDTO
  ): Promise<EventResponse> {
    try {
      // Verify event exists and belongs to tenant
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: eventId,
          tenantId,
        },
      });

      if (!existingEvent) {
        throw new Error("Event not found");
      }

      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
      if (data.location !== undefined) updateData.location = data.location;
      if (data.status !== undefined) updateData.status = data.status;

      const event = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return formatEventResponse(event);
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  },

  // Delete event
  async deleteEvent(eventId: string, tenantId: string): Promise<void> {
    try {
      // Verify event exists and belongs to tenant
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: eventId,
          tenantId,
        },
      });

      if (!existingEvent) {
        throw new Error("Event not found");
      }

      await prisma.event.delete({
        where: {
          id: eventId,
        },
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
    }
  },
};

// ✅ Helper function to format event response
function formatEventResponse(event: any): EventResponse {
  return {
    id: event.id,
    tenantId: event.tenantId,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate.toISOString(),
    location: event.location,
    status: event.status,
    createdBy: event.createdBy,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    creator: event.creator,
  };
}