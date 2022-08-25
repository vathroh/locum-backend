const mongoose = require("mongoose");

const User = mongoose.Schema(
    {
        userName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        firebaseUUID: {
            type: String,
            required: true
        },
        role: {
            type: String
        },
        job: [{
            type: String
        }],
        status: {
            type: String,
            default: "created"
        },
        balcklist: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('User', User);