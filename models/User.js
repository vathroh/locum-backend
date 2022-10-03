const mongoose = require("mongoose");
const { array } = require("mongoose/lib/utils");
var uniqueValidator = require('mongoose-unique-validator');

const User = mongoose.Schema(
    {
        full_name: {
            type: String
        },
        about_me: {
            type: String
        },
        password: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone_number: {
            type: String,
            required: false
        },
        firebaseUUID: {
            type: String,
            required: false
        },
        role: {
            type: String,
            enum: ["user", "super admin", "system admin", "clinic_admin", "doctor", "clinic_assistants"],
            default: "user"
        },
        job: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Doctor',
                exists: true,
                required: false
            }
        ],
        status: {
            type: String,
            default: "created"
        },
        blacklist: {
            type: Boolean,
            default: false
        },
        profile_pict: {
            type: String
        },
        verification_code: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

User.plugin(uniqueValidator);

// export model
module.exports = mongoose.model('User', User);