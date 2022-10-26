const Setting = require("../models/Setting");

const setSyncGoogleCalendar = async (req, res) => {
    const isexists = exists();
    res.json(isexists);
};

const insertUser = async (req, res) => {
    try {
        const setting = new Setting({
            userId: req.user._id,
        });
        const savedSetting = await setting.save();
        res.json(savedSetting);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

const exists = async (req, res) => {
    try {
        const setting = await Setting.find({ userId: req.user._id });
        return setting.length;
        if (setting.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return error.message;
    }
};

module.exports = { setSyncGoogleCalendar };
