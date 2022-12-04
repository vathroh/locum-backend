const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "badge",
        "datetime",
        "locumCard",
        "clinicCard",
        "image",
        "video",
        "audio",
      ],
    },
    conversation_id: {
      type: String,
    },
    sender: {
      type: String,
    },
    card: {
      title: {
        type: String,
      },
      subtitle: {
        type: String,
      },
      date: {
        type: String,
      },
      work_time_start: {
        type: String,
      },
      work_time_finish: {
        type: String,
      },
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
