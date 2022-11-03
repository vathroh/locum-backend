const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const personalInformationSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            exists: true,
        },
        gender: {
            type: String,
            enum: ["male", "female"],
        },
        nationality: {
            type: String,
            required: true,
        },
        nric_fin: {
            type: String,
            required: true,
        },
        date_of_birth: {
            type: Number,
            required: true,
        },
        residential_status: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

personalInformationSchema.plugin(exists);
module.exports = mongoose.model(
    "personalInformation",
    personalInformationSchema
);
