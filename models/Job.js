// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const Job = mongoose.Schema(
    {
        clinic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic',
            exists: true
        },
        date: {
            type: Number,
            required: true
        },
        work_time_start: {
            type: Number,
            required: true
        },
        work_time_finish: {
            type: Number,
            required: true
        },
        profession: {
            type: String,
            required: true,
            enum: ["doctor", "clinical assistant"]
        },
        price: {
            type: Number,
            requiered: true
        },
        prefered_gender: {
            type: String,
            enum: ["male", "female", "both"],
            default: "both"
        },
        scope: [{
            type: String,
            required: true
        }],
        job_description: [{
            type: String,
            required: true
        }],
        booked_by: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        assigned_to: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        completed: {
            type: Boolean,
            default: false
        },
        image: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Job', Job);