const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const NotificationSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    refer: "User",
    exists: true,
  },
  item: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
});

NotificationSchema.plugin(exists);

module.exports = mongoose.model("Notification", NotificationSchema);
