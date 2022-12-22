const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const CertificateitemSchema = mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
});

CertificateitemSchema.plugin(exists);

module.exports = mongoose.model("Certificateitem", CertificateitemSchema);
