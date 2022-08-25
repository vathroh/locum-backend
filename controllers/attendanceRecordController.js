const Record = require("../models/AttendanceRecord.js");
const Doctor = require("../models/Doctor.js")
const Clinic = require("../models/Clinic.js")

const getAttendances = async (req, res) => {

    try {
        Record.find().
            populate('doctor_id').
            populate('clinic_id').
            then((data) => { res.json(data) })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAttendanceById = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        res.json(record);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const saveAttendance = async (req, res) => {

    let date = new Date(req.body.date)
    let time_start = new Date(req.body.date + "T" + req.body.time_start + ":00.000Z")
    let time_end = new Date(req.body.date + "T" + req.body.time_end + ":00.000Z")

    let request = {
        date: date.getTime(),
        time_start: time_start.getTime(),
        time_end: time_end.getTime(),
        doctor_id: req.body.doctor_id,
        clinic_id: req.body.clinic_id
    }

    let record = new Record(request);

    try {
        const savedRecord = await record.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateAttendance = async (req, res) => {
    const cekId = await Record.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedRecord = await Record.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteAttendance = async (req, res) => {
    const cekId = await Record.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedRecord = await Record.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getAttendances, getAttendanceById, saveAttendance, updateAttendance, deleteAttendance }