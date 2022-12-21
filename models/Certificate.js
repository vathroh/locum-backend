const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const CertificateSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    exists: true,
  },
  item: {
    type: String,
  },
  file: {
    type: String,
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: String,
      default: "",
    },
    date_time: {
      type: Number,
      default: 0,
    },
  },
});

CertificateSchema.plugin(exists);

module.exports = mongoose.model("Certificate", CertificateSchema);
