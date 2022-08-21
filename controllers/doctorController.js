const Doctor = require("../models/Doctor.js");

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// function get single doctor
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        res.json(doctor);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

// function Create doctor
const saveDoctor = async (req, res) => {
    const doctor = new Doctor(req.body);
    try {
        const savedDoctor = await doctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// function Update Doctor
const updateDoctor = async (req, res) => {
    const cekId = await Doctor.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedDoctor = await Doctor.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// function Delete Doctor
const deleteDoctor = async (req, res) => {
    const cekId = await Doctor.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedDoctor = await Doctor.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getDoctors, getDoctorById, saveDoctor, updateDoctor, deleteDoctor }