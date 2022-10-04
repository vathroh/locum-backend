// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Clinic = mongoose.Schema(
    {
        logo: {
            type: String,
        },
        group: {
            type: String
        },
        clinicName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        clinicAddress: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        type: [
            {
                type: String
            }
        ],
        comments: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                exists: true
            },
            text: {
                type: String
            },
            datetime: {
                type: Number
            }
        }]
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Clinic', Clinic);