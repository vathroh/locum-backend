// import mongoose 
const mongoose = require("mongoose");

// Buat Schema
const UserRole = mongoose.Schema(
    {
        role: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// export model
module.exports = mongoose.model('Userrole', UserRole);