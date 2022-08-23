const Doctor = require("../models/Doctor.js");
const Clinic = require("../models/Clinic.js");
const Attendance = require("../models/AttendanceRecord.js");

const getDoctorRanks = async (req, res) => {


}


const getDoctorRanksByClinicId = async (req, res) => {
    // console.log(req.query)
    const clinic = await Clinic.findById(req.params.id);
    const genderPreference = req.query.gender;
    const doctors = await Doctor.find();

    console.log(genderPreference)

    const ranks = doctors.map(async (d) => {
        let score = 0
        const score1 = score
        //Gender
        if (genderPreference) {
            if (d.gender == genderPreference) {
                score += 20
            }
        }

        const score2 = score

        //Attendance
        const now = new Date();
        const aDayAgo = now.getTime() - 172800;

        const aDayAttendance = await Attendance.find({
            "doctor.doctorId": d._id, "clinic.clinicId": clinic._id, date: { $lt: `${aDayAgo}` }
        });

        if (aDayAttendance.length > 0) {
            score += 20
        }

        const score3 = score

        return {
            doctorId: d._id,
            doctorName: d.doctorName,
            score: score
        }
    })

    promisedRanks = await Promise.all(ranks)

    res.json(promisedRanks.sort((a, b) => {
        return b.score - a.score
    }))
}

module.exports = { getDoctorRanks, getDoctorRanksByClinicId }