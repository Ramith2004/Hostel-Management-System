import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getPublishedEvents,
} from "../../controllers/Admin/event.controller.ts";
import { authenticateToken } from "../../middleware/auth.middleware.ts";
import { verifyTenant } from "../../middleware/tenant.middleware.ts";
import { requireRole } from "../../middleware/role.middleware.ts";

const router = express.Router();

// ✅ IMPORTANT: Student Route MUST come FIRST (specific route before generic)
// Student Route (Protected - All authenticated users can view published events)
router.get(
  "/student/published",
  authenticateToken,
  verifyTenant,
  getPublishedEvents
);

// ✅ Admin Routes (Protected - ADMIN/WARDEN only)
// Create Event
router.post(
  "/",
  authenticateToken,
  verifyTenant,
  requireRole(["ADMIN", "WARDEN"]),
  createEvent
);

// Get All Events (Admin - with history)
router.get(
  "/",
  authenticateToken,
  verifyTenant,
  requireRole(["ADMIN", "WARDEN"]),
  getEvents
);

// Get Event by ID
router.get(
  "/:id",
  authenticateToken,
  verifyTenant,
  requireRole(["ADMIN", "WARDEN"]),
  getEventById
);

// Update Event
router.put(
  "/:id",
  authenticateToken,
  verifyTenant,
  requireRole(["ADMIN", "WARDEN"]),
  updateEvent
);

// Delete Event
router.delete(
  "/:id",
  authenticateToken,
  verifyTenant,
  requireRole(["ADMIN", "WARDEN"]),
  deleteEvent
);

export default router;