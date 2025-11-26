import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["Going", "Maybe", "Not Going", "Pending"],
          default: "Pending",
        },
        role: {
          type: String,
          enum: ["organizer", "attendee"],
          default: "attendee",
        },
      },
    ],
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text" });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });

export const Event = mongoose.model("Event", eventSchema);
