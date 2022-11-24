const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  conversation_id: {
    type: String,
  },
  sender: {
    type: String,
  },
  text: {
    type: String,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
