const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const CertificateitemSchema = mongoose.Schema({
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

CertificateitemSchema.plugin(exists);

module.exports = mongoose.model("Certificateitem", CertificateitemSchema);
