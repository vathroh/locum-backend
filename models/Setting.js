const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const SettingSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    exists: true,
    uniqeu: true,
  },
  sync_google_calendar: {
    type: Boolean,
    default: false,
  },
  general_notifications: {
    type: Boolean,
    default: false,
  },
  sound: {
    type: Boolean,
    default: false,
  },
  vibration: {
    type: Boolean,
    default: false,
  },
  app_update: {
    type: Boolean,
    default: false,
  },
  upcoming_appointment: {
    type: Boolean,
    default: false,
  },
  canceled_appointment: {
    type: Boolean,
    default: false,
  },
});

SettingSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Setting", SettingSchema);
