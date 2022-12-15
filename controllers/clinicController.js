const Clinic = require("../models/Clinic.js");
const ClinicGroup = require("../models/ClinicGroup.js");
const { genClinicInitials } = require("../utils/genClinicInitial/index.js");
const { gen4RandomNumber } = require("../utils/genRandom/gen4RandomNumber.js");
const multer = require("multer");
const User = require("../models/User.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/clinic");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    res.json(clinic);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const saveClinic = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "The logo must not empty." });

  try {
    const initials = await genClinicInitials(req.body.clinicName);
    const clinic = new Clinic(req.body);
    clinic.logo = "/" + req.file?.destination + "/" + req.file?.filename;
    clinic.code = await genClinicCode("CLI-");
    clinic.initials = initials;

    const savedClinic = await clinic.save();
    res.status(200).json(savedClinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateClinic = async (req, res) => {
  const cekId = await Clinic.findById(req.params.id);
  if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
  try {
    const updatedClinic = await Clinic.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(updatedClinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClinic = async (req, res) => {
  const cekId = await Clinic.findById(req.params.id);
  if (!cekId) return res.status(404).json({ message: "Data tidak ditemukan" });
  try {
    const deletedClinic = await Clinic.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedClinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOtherOutlet = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ _id: req.params.clinicId });
    const clinics = await Clinic.find({
      _id: { $ne: clinic._id },
      group: clinic.group,
    }).lean();

    const data = clinics.map((item) => {
      return formatData(item);
    });

    console.log(data);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClinicByUserId = async (req, res) => {
  try {
    let clinics = [];

    if (req.user.role == "company_admin") {
      const group = await ClinicGroup.findOne({
        user_id: { $in: req.user._id },
      });

      clinics = await Clinic.find({ group: group._id });
    }

    if (req.user.role == "clinic_admin") {
      clinics = await Clinic.find({ user_id: req.user._id });
    }

    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

genClinicCode = async (string) => {
  const code = string + gen4RandomNumber();
  const isExists = await Clinic.findOne({ code: code });

  if (isExists) {
    return code;
  } else {
    return string + gen4RandomNumber();
  }
};

const getAdmin = async (req, res) => {
  try {
    const users = [];
    const clinic = await Clinic.findById(req.query.clinicId);
    const company = await ClinicGroup.findById(clinic.group);

    // return res.json(clinic);

    const clinicAdmin = clinic.user_id?.map(async (userId) => {
      const user = await User.findById(userId).select({
        full_name: 1,
        email: 1,
        phone_number: 1,
        role: 1,
        role_id: 1,
        status: 1,
        profile_picture: 1,
      });
      if (user !== null) users.push(user);
    });

    await Promise.all(clinicAdmin);

    const companyAdmin = company.user_id?.map(async (userId) => {
      const user = await User.findById(userId).select({
        full_name: 1,
        email: 1,
        phone_number: 1,
        role: 1,
        role_id: 1,
        status: 1,
        profile_picture: 1,
      });
      if (user !== null) users.push(user);
    });

    await Promise.all(companyAdmin);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const formatData = (data) => {
  return {
    _id: data._id,
    logo: data.logo ? process.env.BASE_URL + data.logo : "",
    code: data.code,
    clinicName: data.clinicName,
    clinicAddress: data.clinicAddress,
    location: data.location,
    description: data.description,
    type: data.type,
  };
};

module.exports = {
  upload,
  getAdmin,
  getClinics,
  getClinicById,
  saveClinic,
  updateClinic,
  deleteClinic,
  getOtherOutlet,
  getClinicByUserId,
};
