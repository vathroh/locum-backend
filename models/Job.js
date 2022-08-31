// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Job = mongoose.Schema(
    {
        clinic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic'
        },
        date: {
            type: Date,
            required: true
        },
        work_time_start: {
            type: String,
            required: true
        },
        work_time_finish: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            requiered: true
        },
        scope: [{
            type: String,
            required: true
        }]
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Job', Job);