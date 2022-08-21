const mongoose = require("mongoose");

const DoctorRank = mongoose.Schema(
    {
        clinicId: String,
        clinicName: String,
        ranks: [{
            doctorId: String,
            doctorName: String,
            score: Number
        }]
    }
);

// export model
module.exports = mongoose.model('DoctorRanks', DoctorRank);