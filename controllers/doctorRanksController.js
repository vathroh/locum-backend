const Doctor = require("../models/Doctor.js");
const Clinic = require("../models/Clinic.js");
const Attendance = require("../models/AttendanceRecord.js");

const getDoctorRanks = async (req, res) => {


}


const getDoctorRanksByClinicId = async (req, res) => {
    console.log(req.query)
    const clinic = await Clinic.findById(req.params.id);
    const doctors = await Doctor.find();

    const ranks = doctors.map(async (d) => {
        let score = 0
        const attendance = await Attendance.find({
            "doctor.doctorId": d._id, "clinic.clinicId": clinic._id
        });

        if (attendance.length > 0) {
            score += 20
        }

        return {
            doctorId: d._id,
            doctorName: d.doctorName,
            score: score
        }
    })


    res.json(await Promise.all(ranks))
}

module.exports = { getDoctorRanks, getDoctorRanksByClinicId }