const mongoose = require("mongoose");
const { array } = require("mongoose/lib/utils");
var uniqueValidator = require("mongoose-unique-validator");

const User = mongoose.Schema(
  {
    full_name: {
      type: String,
      default: "",
    },
    firebaseUUID: {
      type: String,
    },
    provider: {
      type: String,
    },
    about_me: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    email_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    email_verification_code: {
      type: String,
    },
    phone_number: {
      type: String,
      default: "",
    },
    phone_number_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    phone_verification_code: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: [
        "user",
        "super_admin",
        "system_admin",
        "company_admin",
        "clinic_admin",
        "doctor",
        "clinic_assistants",
      ],
      default: "user",
    },
    role_id: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "created",
      enum: ["created", "pending", "verified", "suspended", "deleted"],
    },
    blacklist: {
      type: Boolean,
      default: false,
    },
    profile_pict: {
      type: String,
      default: "",
    },
    certification: [
      {
        item: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
    achievement: [
      {
        item: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
    resume: {
      type: String,
      default: "",
    },
    preferences: [
      {
        type: String,
        default: [],
        ref: "Preference",
        exists: true,
      },
    ],
    forgot_password_code: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

User.plugin(uniqueValidator);

// export model
module.exports = mongoose.model("User", User);
