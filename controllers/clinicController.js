const Clinic = require("../models/Clinic.js");

const getClinics = async (req, res) => {
    try {
        const clinics = await Clinic.find();
        res.json(clinics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findById(req.params.id);
        res.json(clinic);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const saveClinic = async (req, res) => {
    const clinic = new Clinic(req.body);
    try {
        const savedClinic = await clinic.save();
        res.status(201).json(savedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateClinic = async (req, res) => {
    const cekId = await Clinic.findById(req.params.id);
    if (!cekId)
        return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedClinic = await Clinic.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.status(200).json(updatedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// function Delete Clinic
const deleteClinic = async (req, res) => {
    const cekId = await Clinic.findById(req.params.id);
    if (!cekId)
        return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedClinic = await Clinic.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getOtherOutlet = async (req, res) => {
    try {
        const clinic = await Clinic.findOne({ _id: req.params.clinicId });
        const clinics = await Clinic.find({
            _id: { $ne: clinic._id },
            group: clinic.group,
        });
        res.json(clinics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClinics,
    getClinicById,
    saveClinic,
    updateClinic,
    deleteClinic,
    getOtherOutlet,
};
