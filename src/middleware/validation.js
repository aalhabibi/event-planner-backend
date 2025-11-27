import { body, param, query, validationResult } from "express-validator";

export const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional() // allows it to be omitted; default will be "attendee" in schema
    .isIn(["admin", "organizer", "attendee"])
    .withMessage("Role must be one of: admin, organizer, or attendee"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateCreateEvent = [
  body("title").notEmpty().withMessage("Title is required"),
  body("date").isISO8601().withMessage("Valid date is required (YYYY-MM-DD)"),
  body("time").notEmpty().withMessage("Time is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("description").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateInviteToEvent = [
  param("eventId").isMongoId().withMessage("Valid event ID is required"),
  body("emails")
    .isArray({ min: 1 })
    .withMessage("Emails must be a non-empty array"),
  body("emails.*").isEmail().withMessage("All emails must be valid"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateUpdateStatus = [
  param("eventId").isMongoId().withMessage("Valid event ID is required"),
  body("status")
    .isIn(["Going", "Maybe", "Not Going"])
    .withMessage("Status must be Going, Maybe, or Not Going"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateEventId = [
  param("eventId").isMongoId().withMessage("Valid event ID is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateSearch = [
  query("keyword").optional().isString(),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
  query("role").optional().isIn(["organizer", "attendee"]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateUpdateEvent = [
  param("eventId").isMongoId().withMessage("Valid event ID is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("date").isISO8601().withMessage("Valid date is required (YYYY-MM-DD)"),
  body("time").notEmpty().withMessage("Time is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("description").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];