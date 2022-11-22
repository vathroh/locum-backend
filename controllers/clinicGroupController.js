const multer = require("multer");
const { DateTime } = require("luxon");
const ClinicGroup = require("../models/ClinicGroup");
const Clinic = require("../models/Clinic");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/company");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

const getClinicGroups = async (req, res) => {
    try {
        const data = await ClinicGroup.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClinicGroupByUserId = async (req, res) => {
    try {
        const clinicGroup = await ClinicGroup.findOne({
            user_id: { $in: req.user._id },
        });
        res.json(clinicGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClinicGroupById = async (req, res) => {
    try {
        const clinic = await ClinicGroup.findById(req.params.id);
        res.json(clinic);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const getClinicsByGroup = async (req, res) => {
    try {
        const clinics = await Clinic.find({ group: req.params.groupId });
        res.json(clinics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveClinicGroup = async (req, res) => {
    try {
        req.body.date_of_registration = DateTime.fromISO(
            req.body.date_of_registration,
            {
                zone: "Asia/Singapore",
            }
        ).toMillis();
        const clinic = new ClinicGroup(req.body);

        const savedClinic = await clinic.save();
        res.status(200).json(savedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const mailingAddress = async (req, res) => {
    if (req.body.business_name == "")
        return res
            .status(400)
            .json({ message: "Business name must not be empty." });
    if (req.body.delivery_address == "")
        return res
            .status(400)
            .json({ message: "Delivery address must not be empty." });
    if (req.body.postal_code == "")
        return res
            .status(400)
            .json({ message: "Postal code must not be empty." });

    try {
        const updatedClinic = await ClinicGroup.updateOne(
            { _id: req.params.groupId },
            { $set: { mailing_details: req.body } }
        );
        res.status(200).json(updatedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const documents = async (req, res) => {
    try {
        const files = Object.keys(req.files);
        const data = {};

        files.map(async (item) => {
            const file = req.files[item][0];
            data[file.fieldname] = { file_name: "/" + file.path };
            if (file.fieldname == "moh_licence") {
                data[file.fieldname]["valid_from"] = DateTime.fromISO(
                    req.body.valid_from,
                    {
                        zone: "Asia/Singapore",
                    }
                ).toMillis();
                data[file.fieldname]["valid_to"] = DateTime.fromISO(
                    req.body.valid_to,
                    {
                        zone: "Asia/Singapore",
                    }
                ).toMillis();
            }
        });

        const updatedClinic = await ClinicGroup.updateOne(
            { _id: req.params.groupId },
            { $set: { documents: data } }
        );
        res.status(200).json(updatedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateClinic = async (req, res) => {
    const cekId = await ClinicGroup.findById(req.params.id);
    if (!cekId)
        return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const updatedClinic = await ClinicGroup.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.status(200).json(updatedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteClinic = async (req, res) => {
    const cekId = await ClinicGroup.findById(req.params.id);
    if (!cekId)
        return res.status(404).json({ message: "Data tidak ditemukan" });
    try {
        const deletedClinic = await ClinicGroup.deleteOne({
            _id: req.params.id,
        });
        res.status(200).json(deletedClinic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getClinicGroupByUserId,
    getClinicsByGroup,
    saveClinicGroup,
    getClinicGroups,
    mailingAddress,
    documents,
    upload,
};
