const mongoose = require("mongoose");

const Attendance = mongoose.Schema({
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    clinic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
    },
    check_in: {
        type: Number,
    },
    check_out: {
        type: Number,
    },
});

module.exports = mongoose.model("Attendance", Attendance);
