// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Doctor = mongoose.Schema(
    {
        doctorName: {
            type: String,
            required: true
        },
        specialist: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: ['male', 'female']
        },
        userID: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Doctor', Doctor);
