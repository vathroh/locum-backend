const mongoose = require("mongoose");
const { array } = require("mongoose/lib/utils");

const User = mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        firebaseUUID: {
            type: String,
            required: true,
            unique: true
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
        }
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('User', User);