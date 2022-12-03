const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const Clinic = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: true,
    },
    group: {
      type: String,
      required: true,
    },
    clinicName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    clinicAddress: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      enum: ["Central", "East", "North", "North-east", "West"],
    },
    type: [
      {
        type: String,
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          exists: true,
        },
        text: {
          type: String,
        },
        datetime: {
          type: Number,
        },
      },
    ],
    favorites: [
      {
        type: String,
      },
    ],
    blacklist: [
      {
        type: String,
        refer: "User",
        exists: true,
      },
    ],
    whitelist: [
      {
        type: String,
        refer: "User",
        exists: true,
      },
    ],
    user_id: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

mongoose.plugin(exists);
module.exports = mongoose.model("Clinic", Clinic);
