const mongoose = require("mongoose");

const CalendarSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    clinic_id: {
      type: String,
      required: true,
    },
    job_id: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    date: {
      type: Number,
    },
    start: {
      type: Number,
    },
    finish: {
      type: Number,
    },
    type: {
      type: String,
      enum: ["appointment", "interview"],
    },
    attendees: {
      type: Array,
    },
    htmlLink: {
      type: String,
    },
    link: {
      type: String,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Calendar", CalendarSchema);
