const OtherCertificate = require("../models/Othercertificate");
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

const getOtherCertificate = async (req, res) => {
  try {
    const certificates = await OtherCertificate.find();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOtherCertificateByUser = async (req, res) => {
  try {
    const certificates = await OtherCertificate.find({
      user_id: req.params.userId,
    });
    res.json(certificates);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const saveOtherCertificate = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "The file is empty" });

  if (!req.body.certificate)
    return res.status(400).json({ message: "The certificate must not empty" });

  data = {};
  data.user_id = req.body.user_id;
  data.certificate = req.body.certificate;
  data.file = "/" + req.file?.destination + "/" + req.file?.filename;

  try {
    const isExists = await OtherCertificate.findOne({
      user_id: req.body.user_id,
      certificate: req.body.certificate,
    });
    console.log(isExists);
    if (isExists)
      return res.status(400).json({
        message:
          "The certificate has been uploaded before. Please upload other.",
      });

    const otherCertificate = new OtherCertificate(data);
    const certificate = await otherCertificate.save();
    res.status(200).json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// const updateDevice = async (req, res) => {
//   try {
//     const cekId = await Devices.findById(req.params.id);
//     if (!cekId)
//       return res
//         .status(404)
//         .json({ message: "the devie id can not be found." });
//     const updatedDevice = await Device.updateOne(
//       { _id: req.params.id },
//       { $set: req.body }
//     );
//     res.status(200).json(updatedDevice);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// const deleteDevice = async (req, res) => {
//   try {
//     const cekId = await Device.findById(req.params.id);
//     if (!cekId)
//       return res
//         .status(404)
//         .json({ message: "The device_id can not be found." });

//     const deletedDevice = await Device.deleteOne({ _id: req.params.id });
//     res.status(200).json(deletedDevice);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

module.exports = {
  getOtherCertificate,
  getOtherCertificateByUser,
  saveOtherCertificate,
  upload,
};
