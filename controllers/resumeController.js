const Resume = require("../models/Resume");
const ObjectId = require("mongoose/lib/types/objectid");
const { resumeLogger } = require("../services/logger/resumeLogger");
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

const saveResume = async (req, res) => {
    try {
        if (!req.file)
            return res.status(404).json({ message: "The file is empty" });

        data = {};
        data.user_id = req.params.userId;
        data.file = "/" + req.file?.destination + "/" + req.file?.filename;
        const resume = new Resume(data);
        await resume.save();

        resumeLogger.info(`url: ${req.originalUrl}, uploaded successfully.`);

        res.json({
            message: "The resume has been uploaded successfully.",
        });
    } catch (error) {
        resumeLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
        );
        res.status(500).json({ message: "There is something wrong." });
    }
};

const getResume = async (req, res) => {
    try {
        const resume = await Resume.find({
            user_id: ObjectId(req.user._id),
        });

        res.json(resume);
    } catch (error) {
        resumeLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${req.params.userId}`
        );
        res.status(500).json({ message: error.message });
    }
};

module.exports = { saveResume, getResume, upload };
