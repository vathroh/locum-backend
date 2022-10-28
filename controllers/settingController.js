const Setting = require("../models/Setting");

const syncGoogleCalendar = async (req, res) => {
    try {
        const setting = await Setting.findOne({ user_id: req.user._id });
        if (!setting) {
            try {
                const setting = new Setting({
                    user_id: req.user._id,
                    sync_google_calendar: true,
                });
                const savedSetting = await setting.save();
                res.json(savedSetting);
            } catch (error) {
                res.status(500).json(error.message);
            }
        } else {
            if (setting.sync_google_calendar) {
                await Setting.updateOne(
                    { userId: req.user._id },
                    { sync_google_calendar: false }
                );
            } else {
                await Setting.updateOne(
                    { userId: req.user._id },
                    { sync_google_calendar: true }
                );
            }
        }

        const newSetting = await Setting.findOne({
            userId: req.user._id,
        }).select({ sync_google_calendar: 1 });
        res.json(newSetting);
    } catch (error) {
        res.status(500).json(error.message);
    }
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

module.exports = { syncGoogleCalendar };
