const mongoose = require("mongoose");

const Attendance = mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clinic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
  },
  check_in: {
    type: Number,
    default: null,
  },
  check_out: {
    type: Number,
    default: null,
  },
  overtime: {
    type: Number,
    default: 0,
  },
  totalWorkHour: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Attendance", Attendance);
