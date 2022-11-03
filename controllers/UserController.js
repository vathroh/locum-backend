const User = require("../models/User.js");
const Personal = require("../models/personalInormation");
const Document = require("../models/personalDocument");
const practicingDocument = require("../models/practicingInformation");
const { DateTime } = require("luxon");
const multer = require("multer");
const path = require("path");
const { userLogger } = require("../services/logger/userLogger");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/user");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

const getUsers = async (req, res) => {
    try {
        const users = await User.find().then((data) => {
            res.json(data);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select({
            full_name: 1,
            profile_pict: 1,
            phone_number: 1,
            email: 1,
            role: 1,
            about_me: 1,
            certification: 1,
            preferences: 1,
            resume: 1,
            achievement: 1,
        });

        const data = {
            _id: user._id,
            full_name: user.full_name ?? "",
            profile_pict: user.profile_pict ?? "",
            phone_number: user.phone_number ?? "",
            email: user.email ?? "",
            role: user.role ?? "",
            about_me: user.about_me ?? "",
            certification: user.certification ?? [],
            preferences: user.preferences ?? [],
            resume: user.resume ?? "",
            achievement: user.achievement ?? [],
        };
        res.json(data);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const saveUser = async (req, res) => {
    const user = new User(req.body);
    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const cekId = await User.findById(req.params.id);
        if (!cekId) {
            return res.status(404).json({ message: "The data not found" });
        }

        if (req.body.full_name) {
            cekId.full_name = req.body.full_name;
        }

        if (req.body.about_me) {
            cekId.about_me = req.body.about_me;
        }

        if (req.body.profile_pict) {
            cekId.profile_pict = req.body.profile_pict;
        }

        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const cekId = await User.findById(req.params.id);
        if (!cekId) {
            return res.status(404).json({ message: "The data not found" });
        }
        const deletedUser = await User.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const preferences = async (req, res) => {
    try {
        const preferences = await User.findById(req.params.userId)
            .select({
                prefrences: 1,
            })
            .lean()
            .then((data) => {
                const user = {};
                user._id = data._id ?? "";
                user.preferences = data.preferences ?? [];
                res.json(user);
            })
            .catch((error) => {
                res.status(500).json({ message: error.message });
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const personalInformation = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        user.full_name = req.body.name;
        await User.updateOne({ _id: req.params.userId }, { $set: user });

        const dob = DateTime.fromISO(
            req.body.date_of_birth + "T00:00:00.000+08:00"
        ).toMillis();

        const info = {
            user_id: req.params.userId,
            gender: req.body.gender,
            nationality: req.body.nationality,
            nric_fin: req.body.nric_fin,
            date_of_birth: dob,
            residential_status: req.body.residential_status,
            address: req.body.address,
        };

        const personal = await Personal.findOne({ user_id: user._id });

        if (personal) {
            const updated = await Personal.updateOne(
                { user_id: user._id },
                { $set: info }
            );
            res.json(updated);
        } else {
            const personal = new Personal(info);
            const saved = await personal.save();
            res.json(saved);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const practicingInformation = async (req, res) => {
    const { registration_number, full_registration, valid_until, valid_from } =
        req.body;

    try {
        const from = DateTime.fromISO(
            valid_from + "T00:00:00.000+08:00"
        ).toMillis();
        const until = DateTime.fromISO(
            valid_until + "T00:00:00.000+08:00"
        ).toMillis();
        const information = new practicingDocument({
            registration_number: registration_number,
            full_registration: full_registration,
            valid_from: from,
            valid_until: until,
        });
        const practicingInformation = await information.save();
        userLogger.info(req.originalUrl);
        res.json(practicingInformation);
    } catch (error) {
        userLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const personalDocument = async (req, res) => {
    try {
        const files = Object.keys(req.files);
        files.map(async (item) => {
            const file = req.files[item][0];
            const data = {};
            data.user_id = req.user._id;
            data.name = file.fieldname;
            data.file = "/" + file.path;

            const doc = new Document(data);
            const saveDoc = await doc.save();
        });
        userLogger.info(`url: ${req.originalUrl}, data: ${req.files}`);
        res.json({ message: "files have been uploaded successfully." });
    } catch (error) {
        userLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: "There is something wrong." });
    }
};
module.exports = {
    upload,
    getUsers,
    saveUser,
    updateUser,
    deleteUser,
    preferences,
    getUserById,
    personalDocument,
    personalInformation,
    practicingInformation,
};
