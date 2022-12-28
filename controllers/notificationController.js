const Notification = require("../models/Notification");
const User = require("../models/User");

const getNotificationByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.query.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = await Notification.find({
      user_id: req.query.id,
    });

    res.json(notifications);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const newNotification = await notification.save();
    res.status(200).json(newNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const cekId = await Notification.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data not found." });

    const hasRead = await Notification.updateOne(
      { _id: req.params.id },
      { $set: { is_read: true } }
    );
    res.status(200).json(hasRead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const cekId = await Notification.findById(req.params.id);
    if (!cekId) return res.status(404).json({ message: "Data not found." });

    const deleted = await Notification.deleteOne({ _id: req.params.id });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotificationByUserId,
  deleteNotification,
  sendNotification,
  readNotification,
};
