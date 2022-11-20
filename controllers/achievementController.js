const Achievement = require("../models/Achievement");
const { achievementLogger } = require("../services/logger/achievementLogger");
const multer = require("multer");

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

        achievementLogger.info(
            `url: ${req.originalUrl}, uploaded successfully`
        );

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

module.exports = { getAchievement, postAchievement, upload };
