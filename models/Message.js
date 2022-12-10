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
      required: true,
    },
    sender: {
      type: String,
      required: true,
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
    is_read: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
