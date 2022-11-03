const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const personalDocumentSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            exists: true,
        },
        name: {
            type: String,
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("personalDocument", personalDocumentSchema);
