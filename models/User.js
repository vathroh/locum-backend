const mongoose = require("mongoose");
const { array } = require("mongoose/lib/utils");
var uniqueValidator = require("mongoose-unique-validator");

const User = mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
            default: "",
        },
        about_me: {
            type: String,
            required: true,
            default: "",
        },
        password: {
            type: String,
        },
        email: {
            type: String,
            required: false,
            unique: true,
        },
        email_verified: {
            type: Boolean,
            required: true,
            default: false,
        },
        email_verification_code: {
            type: String,
        },
        phone_number: {
            type: String,
            required: true,
            default: "",
        },
        phone_number_verified: {
            type: Boolean,
            required: true,
            default: false,
        },
        phone_verification_code: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: [
                "user",
                "super admin",
                "system admin",
                "clinic_admin",
                "doctor",
                "clinic_assistants",
            ],
            default: "user",
        },
        status: {
            type: String,
            default: "created",
        },
        blacklist: {
            type: Boolean,
            default: false,
        },
        profile_pict: {
            type: String,
            default: "",
        },
        certification: [
            {
                item: {
                    type: String,
                },
                file: {
                    type: String,
                },
            },
        ],
        achievement: [
            {
                item: {
                    type: String,
                },
                file: {
                    type: String,
                },
            },
        ],
        resume: {
            type: String,
            default: "",
        },
        preferences: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

User.plugin(uniqueValidator);

// export model
module.exports = mongoose.model("User", User);
