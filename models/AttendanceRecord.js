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
        doctor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        clinic_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic'
        }
    }
);

module.exports = mongoose.model('Attendance', Attendance);
