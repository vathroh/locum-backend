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

const getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({ user_id: req.user._id });

    if (!setting)
      return res.status(404).json({ message: "Setting not found." });

    res.json(setting);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const setSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({ user_id: req.user._id });

    if (!setting) insertUser(req, res);

    if (req.query.sync_google_calendar) {
      const sync_google_calendar = setting.sync_google_calendar;
      setting.sync_google_calendar = !sync_google_calendar;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.general_notifications) {
      const generalNotifications = setting.general_notifications;
      setting.general_notifications = !generalNotifications;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.sound) {
      const sound = setting.sound;
      setting.sound = !sound;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.vibration) {
      const vibration = setting.vibration;
      setting.vibration = !vibration;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.app_update) {
      const app_update = setting.app_update;
      setting.app_update = !app_update;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.upcoming_appointment) {
      const upcomingAppointment = setting.upcoming_appointment;
      setting.upcoming_appointment = !upcomingAppointment;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    if (req.query.canceled_appointment) {
      const canceledAppointment = setting.canceled_appointment;
      setting.canceled_appointment = !canceledAppointment;
      await Setting.updateOne({ _id: setting._id }, { $set: setting });
    }

    const newSetting = await Setting.findOne({ _id: setting._id });
    return res.json(newSetting);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = { syncGoogleCalendar, setSetting, getSetting };
