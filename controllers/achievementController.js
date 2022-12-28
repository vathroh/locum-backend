const Achievement = require("../models/Achievement");
const { achievementLogger } = require("../services/logger/achievementLogger");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/user");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.find({
      user_id: req.params.userId,
    });

    achievementLogger.info(`url: ${req.originalUrl}`);

    res.json(achievement);
  } catch (error) {
    achievementLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const postAchievement = async (req, res) => {
  try {
    if (!req.file)
      return res.status(404).json({ message: "The file is empty" });

    data = {};
    data.item = req.body.item;
    data.user_id = req.params.userId;
    data.file = "/" + req.file?.destination + "/" + req.file?.filename;
    const achievement = new Achievement(data);
    await achievement.save();

    achievementLogger.info(`url: ${req.originalUrl}, uploaded successfully`);

    res.json({
      message: "The achievement has been inputed successfully.",
    });
  } catch (error) {
    achievementLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  const cekId = await Achievement.findById(req.params.id);
  if (!cekId) return res.status(404).json({ message: "Data not found." });

  try {
    if (fs.existsSync("." + cekId.file)) {
      fs.unlink("." + cekId.file, (err) => {
        if (err) {
          throw err;
        }
      });
    }
  } catch (err) {
    console.error(err);
  }

  try {
    const deleted = await Achievement.deleteOne({ _id: req.params.id });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAchievement, postAchievement, deleteAchievement, upload };
