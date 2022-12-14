const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: String,
        required: true,
        ref: "User",
        exists: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

ConversationSchema.plugin(exists);

module.exports = mongoose.model("Conversation", ConversationSchema);
