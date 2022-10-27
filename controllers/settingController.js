const Setting = require("../models/Setting");

const syncGoogleCalendar = async (req, res) => {
    const setting = await Setting.findOne({ user_id: req.user._id });
    const hal = Setting.updateOne(
        { _id: setting._id },
        { sync_google_calendar: false }
    );
    return res.json(setting);
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
        Setting.updateOne(
            { userId: req.user._id },
            { sync_google_calendar: false }
        );
        // if (setting.sync_google_calendar) {
        //     Setting.updateOne(
        //         { userId: req.user._id },
        //         { sync_google_calendar: false }
        //     );
        // } else {
        //     Setting.updateOne(
        //         { userId: req.user._id },
        //         { sync_google_calendar: true }
        //     );
        // }
    }

    const newSetting = await Setting.findOne({ userId: req.user._id });

    res.json(newSetting);
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
