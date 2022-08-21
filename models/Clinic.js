// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Clinic = mongoose.Schema(
    {
        clinicName: {
            type: String,
            required: true
        },
        clinicAddress: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Clinics', Clinic);