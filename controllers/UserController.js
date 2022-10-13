const User = require("../models/User.js");

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .then((data) => {
                res.json(data);
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select({ full_name: 1, profile_pict: 1, phone_number: 1, email: 1, role: 1, about_me: 1, certification: 1, preferences: 1, resume: 1, achievement: 1 });
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const saveUser = async (req, res) => {
    const user = new User(req.body);
    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    const cekId = await User.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "The data not found" });
    try {
        const updatedUser = await User.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    const cekId = await User.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "The data not found" });
    try {
        const deletedUser = await User.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getUsers, getUserById, saveUser, updateUser, deleteUser }