const Vaccination = require("../models/Vaccination");
const ObjectId = require("mongoose/lib/types/objectid");
const { vaccinationLogger } = require("../services/logger/vaccinationLogger");
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

const saveVaccination = async (req, res) => {
    try {
        const files = Object.keys(req.files);
        files.map(async (item) => {
            const file = req.files[item][0];
            const data = {};
            data.user_id = req.user._id;
            data.item = file.fieldname;
            data.file = "/" + file.path;

            const doc = new Vaccination(data);
            const saveDoc = await doc.save();
        });
        vaccinationLogger.info(
            `url: ${req.originalUrl}, data: ${JSON.stringify(req.files)}`
        );
        res.json({ message: "files have been uploaded successfully." });
    } catch (error) {
        vaccinationLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
        );
        res.status(500).json({ message: "There is something wrong." });
    }
};

const getVaccination = async (req, res) => {
    try {
        const vaccination = await Vaccination.find({
            user_id: ObjectId(req.user._id),
        });
        res.json(vaccination);
    } catch (error) {
        vaccinationLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${req.params.userId}`
        );
        res.status(500).json({ message: error.message });
    }
};

module.exports = { saveVaccination, getVaccination, upload };
