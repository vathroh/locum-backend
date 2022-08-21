const UserRole = require("../models/UserRole.js");

const getUserRoles = async (req, res) => {
    try {
        const userRoles = await UserRole.find();
        res.json(userRoles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserRoleById = async (req, res) => {
    try {
        const userRole = await UserRole.findById(req.params.id);
        res.json(userRole);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const saveUserRole = async (req, res) => {
    const userRole = new UserRole(req.body);
    try {
        const savedUser = await userRole.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateUserRole = async (req, res) => {
    const cekId = await UserRole.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedUserRole = await UserRole.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedUserRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteUserRole = async (req, res) => {
    const cekId = await UserRole.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedUserRole = await UserRole.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedUserRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getUserRoles, getUserRoleById, saveUserRole, updateUserRole, deleteUserRole }