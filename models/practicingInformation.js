const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const practicingInformationSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            exists: true,
        },
        registration_number: {
            type: String,
            required: true,
        },
        full_registration: {
            type: Boolean,
            required: true,
        },
        valid_from: {
            type: Number,
            required: true,
        },
        valid_until: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

practicingInformationSchema.plugin(exists);

module.exports = mongoose.model(
    "practicingInformation",
    practicingInformationSchema
);
