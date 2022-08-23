// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Attendance = mongoose.Schema(
    {
        date: {
            type: Number,
            required: true
        },
        time_start: {
            type: Number,
            required: true
        },
        time_end: {
            type: Number
        },
        doctor: [
            {
                doctorId: String,
                doctorName: String
            }
        ],
        clinic: [
            {
                clinicId: String,
                clinicName: String
            }
        ]
    }
);

module.exports = mongoose.model('Attendances', Attendance);
