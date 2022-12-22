const mongoose = require("mongoose");

const OnlineUserSchema = mongoose.Schema(
  {
    user: {
      type: String,
    },
    socket: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnlineUser", OnlineUserSchema);
