import express from "express";
import {
  createEvent,
  getMyOrganizedEvents,
  getMyInvitedEvents,
  getAllMyEvents,
  getEventById,
  inviteToEvent,
  updateAttendanceStatus,
  getEventAttendees,
  deleteEvent,
  searchEvents,
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  validateCreateEvent,
  validateInviteToEvent,
  validateUpdateStatus,
  validateEventId,
  validateSearch,
} from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create event
router.post("/", validateCreateEvent, createEvent);

// Get events
router.get("/organized", getMyOrganizedEvents);
router.get("/invited", getMyInvitedEvents);
router.get("/all", getAllMyEvents);
router.get("/search", validateSearch, searchEvents);

// Single event operations
router.get("/:eventId", validateEventId, getEventById);
router.post("/:eventId/invite", validateInviteToEvent, inviteToEvent);
router.patch("/:eventId/status", validateUpdateStatus, updateAttendanceStatus);
router.get("/:eventId/attendees", validateEventId, getEventAttendees);
router.delete("/:eventId", validateEventId, deleteEvent);

export default router;
