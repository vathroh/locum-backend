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
});

CertificateSchema.plugin(exists);

module.exports = mongoose.model("Certificate", CertificateSchema);
