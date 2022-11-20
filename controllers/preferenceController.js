const Preference = require("../models/Preference");

const getPreferences = async (req, res) => {
    try {
        const Preferences = await Preference.find().then((data) => {
            res.json(data);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const savePreference = async (req, res) => {
    try {
        const preference = new Preference(req.body);
        const savedPreference = await preference.save();
        res.status(200).json(savedPreference);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePreference = async (req, res) => {
    try {
        const cekId = await Preference.findById(req.params.id);
        if (!cekId) {
            return res.status(404).json({ message: "The data not found" });
        }

        const updatedPreference = await Preference.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );

        res.status(200).json(updatedPreference);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePreference = async (req, res) => {
    try {
        const cekId = await Preference.findById(req.params.id);
        if (!cekId) {
            return res.status(404).json({ message: "The data not found" });
        }
        const deletedPreference = await Preference.deleteOne({
            _id: req.params.id,
        });
        res.status(200).json(deletedPreference);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getPreferences,
    savePreference,
    updatePreference,
    deletePreference,
};
