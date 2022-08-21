// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Attendance = mongoose.Schema(
    {
        date: {
            type: String,
            required: true
        },
        time_start: {
            type: String,
            required: true
        },
        time_end: {
            type: String,
            required: true
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
