import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, location } = req.body;
    const organizerId = req.user.id;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      organizer: organizerId,
      attendees: [
        {
          user: organizerId,
          status: "Going",
          role: "organizer",
        },
      ],
    });

    await event.populate("organizer", "name email");
    await event.populate("attendees.user", "name email");

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Get all events organized by the user
export const getMyOrganizedEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({ organizer: userId })
      .populate("organizer", "name email")
      .populate("attendees.user", "name email")
      .sort({ date: 1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// Get all events the user is invited to (as attendee)
export const getMyInvitedEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({
      "attendees.user": userId,
      organizer: { $ne: userId },
    })
      .populate("organizer", "name email")
      .populate("attendees.user", "name email")
      .sort({ date: 1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// Get all events (organized + invited)
export const getAllMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({
      "attendees.user": userId,
    })
      .populate("organizer", "name email")
      .populate("attendees.user", "name email")
      .sort({ date: 1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// Get single event details
export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId)
      .populate("organizer", "name email")
      .populate("attendees.user", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is part of this event
    const isAttendee = event.attendees.some(
      (att) => att.user._id.toString() === userId
    );

    if (!isAttendee) {
      return res
        .status(403)
        .json({ message: "You are not invited to this event" });
    }

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// Invite users to event
export const inviteToEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { emails } = req.body; // Array of email addresses
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the organizer can invite attendees" });
    }

    // Find users by email
    const usersToInvite = await User.find({ email: { $in: emails } });
    if (usersToInvite.length === 0) {
      return res.status(404).json({ message: "No valid users found" });
    }

    // Add users as attendees if not already added
    const newAttendees = [];
    for (const user of usersToInvite) {
      const alreadyInvited = event.attendees.some(
        (att) => att.user.toString() === user._id.toString()
      );
      if (!alreadyInvited) {
        event.attendees.push({
          user: user._id,
          status: "Pending",
          role: "attendee",
        });
        newAttendees.push(user.email);
      }
    }

    await event.save();
    await event.populate("organizer", "name email");
    await event.populate("attendees.user", "name email");

    res.json({
      message: `Invited ${newAttendees.length} user(s)`,
      invitedEmails: newAttendees,
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Update attendance status
export const updateAttendanceStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the attendee
    const attendee = event.attendees.find(
      (att) => att.user.toString() === userId
    );

    if (!attendee) {
      return res
        .status(403)
        .json({ message: "You are not invited to this event" });
    }

    // Organizer cannot change their status from "Going"
    if (attendee.role === "organizer") {
      return res
        .status(400)
        .json({ message: "Organizers cannot change their attendance status" });
    }

    attendee.status = status;
    await event.save();
    await event.populate("organizer", "name email");
    await event.populate("attendees.user", "name email");

    res.json({
      message: "Attendance status updated",
      event,
    });
  } catch (err) {
    next(err);
  }
};

// Get attendees list for an event
export const getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId).populate(
      "attendees.user",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only organizers can view attendee details" });
    }

    res.json({
      eventTitle: event.title,
      attendees: event.attendees,
    });
  } catch (err) {
    next(err);
  }
};

// Delete an event
export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the organizer can delete this event" });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Advanced search and filter
export const searchEvents = async (req, res, next) => {
  try {
    const { keyword, startDate, endDate, role } = req.query;
    const userId = req.user.id;

    let query = { "attendees.user": userId };

    // Text search on title and description
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Role filter (organizer or attendee)
    if (role) {
      if (role === "organizer") {
        query.organizer = userId;
      } else if (role === "attendee") {
        query.organizer = { $ne: userId };
      }
    }

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .populate("attendees.user", "name email")
      .sort({ date: 1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// Update event details (organizer only)
export const updateEventDetails = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { title, description, date, time, location } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only organizer can update event details
    if (event.organizer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the organizer can update this event" });
    }

    // Update allowed fields only
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;

    await event.save();

    await event.populate("organizer", "name email");
    await event.populate("attendees.user", "name email");

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (err) {
    next(err);
  }
};
