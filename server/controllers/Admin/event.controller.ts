import type { Request, Response } from "express";
import { eventService } from "../../services/event.service.ts";
import type { CreateEventDTO, UpdateEventDTO } from "../../types/event.type.ts";

// Create Event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, eventDate, location, status } = req.body;
    const tenantId = req.user?.tenantId;
    const createdBy = req.user?.userId;

    // Validation
    if (!title || !description || !eventDate || !location || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!tenantId || !createdBy) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const eventData: CreateEventDTO = {
      title: title.trim(),
      description: description.trim(),
      eventDate: new Date(eventDate),
      location: location.trim(),
      status,
    };

    const event = await eventService.createEvent(tenantId, createdBy, eventData);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// Get All Events (Admin - with history)
export const getEvents = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await eventService.getEvents(tenantId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: result.events,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch events",
    });
  }
};

// Get Published Events (Student)
export const getPublishedEvents = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await eventService.getPublishedEvents(tenantId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Published events retrieved successfully",
      data: result.events,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching published events:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch published events",
    });
  }
};

// Get Event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const event = await eventService.getEventById(id, tenantId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch event",
    });
  }
};

// Update Event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, eventDate, location, status } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Check if event exists
    const existingEvent = await eventService.getEventById(id, tenantId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const updateData: UpdateEventDTO = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (location !== undefined) updateData.location = location.trim();
    if (status !== undefined) updateData.status = status;

    const updatedEvent = await eventService.updateEvent(id, tenantId, updateData);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

// Delete Event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Check if event exists
    const existingEvent = await eventService.getEventById(id, tenantId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await eventService.deleteEvent(id, tenantId);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};