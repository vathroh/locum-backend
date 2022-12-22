const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const OtherCertificateSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    exists: true,
  },
  certificate: {
    type: String,
    required: true,
  },
  file: {
    type: String,
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified_by: {
      type: String,
      default: "",
    },
    date_time: {
      type: Number,
      default: 0,
    },
  },
});

OtherCertificateSchema.plugin(exists);

module.exports = mongoose.model("OtherCertificate", OtherCertificateSchema);
