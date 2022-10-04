const ClinicGroup = require('../models/ClinicGroup')


const getClinicGroups = async (req, res) => {
    try {
        const data = await ClinicGroup.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getClinicGroupById = async (req, res) => {
    try {
        const clinic = await ClinicGroup.findById(req.params.id);
        res.json(clinic);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}


const saveClinicGroup = async (req, res) => {
    const clinic = new ClinicGroup(req.body);
    try {
        const savedClinic = await clinic.save();
        res.status(201).json(savedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


const updateClinic = async (req, res) => {
    const cekId = await ClinicGroup.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedClinic = await ClinicGroup.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteClinic = async (req, res) => {
    const cekId = await ClinicGroup.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedClinic = await ClinicGroup.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    saveClinicGroup,
    getClinicGroups,
}