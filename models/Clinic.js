// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Clinic = mongoose.Schema(
    {
        logo: {
            type: String,
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
        ]
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Clinic', Clinic);