const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const DeviceSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    refer: "User",
    exists: true,
  },
  device_id: {
    type: String,
    required: true,
  },
});

DeviceSchema.plugin(exists);

module.exports = mongoose.model("Device", DeviceSchema);
