const Record = require("../models/AttendanceRecord.js");

const getAttendances = async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
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
    const record = new Record(req.body);
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