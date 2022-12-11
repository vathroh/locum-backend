// import mongoose
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Buat Schema
const Job = mongoose.Schema(
  {
    code: {
      type: String,
      size: 3,
      required: true,
      unique: true,
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      exists: true,
    },
    date: {
      type: Number,
      required: true,
    },
    work_time_start: {
      type: Number,
      required: true,
    },
    work_time_finish: {
      type: Number,
      required: true,
    },
    profession: {
      type: String,
      required: true,
      enum: ["doctor", "clinical assistant"],
    },
    price: {
      type: Number,
      requiered: true,
    },
    urgent_price_24: {
      type: Number,
    },
    urgent_price_72: {
      type: Number,
    },
    scope: [
      {
        type: String,
        required: true,
      },
    ],
    job_description: [
      {
        type: String,
        required: true,
      },
    ],
    break: {
      start: {
        type: Number,
      },
      finish: {
        type: Number,
      },
    },
    preferences: [
      {
        type: String,
      },
    ],
    criterias: [
      {
        type: String,
      },
    ],
    booked_by: [
      {
        type: String,
      },
    ],
    assigned_to: [
      {
        type: String,
      },
    ],
    rejected: [
      {
        type: String,
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    canceled_by: {
      type: Array,
    },
    image: {
      type: String,
    },
    favorites: {
      type: Array,
    },
    urgent_status: {
      type: String,
      default: "normal",
      enum: ["normal", "72", "24"],
    },
    listing_type: {
      type: String,
      enum: ["manual_listing", "automated_listing", "direct_listing"],
      default: "manual_listing",
    },
  },
  {
    timestamps: true,
  }
);

Job.plugin(uniqueValidator);
// export model
module.exports = mongoose.model("Job", Job);
