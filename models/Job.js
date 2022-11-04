// import mongoose
const mongoose = require("mongoose");

// Buat Schema
const Job = mongoose.Schema(
    {
        clinic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            exists: true,
        },
        date: {
            type: Number,
            required: true,
        },
        work_time_start: {
            type: Number,
            required: true,
        },
        work_time_finish: {
            type: Number,
            required: true,
        },
        profession: {
            type: String,
            required: true,
            enum: ["doctor", "clinical assistant"],
        },
        price: {
            type: Number,
            requiered: true,
        },
        prefered_gender: {
            type: String,
            enum: ["male", "female"],
        },
        scope: [
            {
                type: String,
                required: true,
            },
        ],
        job_description: [
            {
                type: String,
                required: true,
            },
        ],
        preferences: [
            {
                type: String,
            },
        ],
        booked_by: [
            {
                type: String,
            },
        ],
        assigned_to: [
            {
                type: String,
            },
        ],
        completed: {
            type: Boolean,
            default: false,
        },
        canceled_by: {
            type: Array,
        },
        image: {
            type: String,
        },
        favorites: {
            type: Array,
        },
        isUrgent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// export model
module.exports = mongoose.model("Job", Job);
