const Certificate = require("../models/Certificate");
const ObjectId = require("mongoose/lib/types/objectid");
const { certificateLogger } = require("../services/logger/certificateLogger");
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

const saveCertificate = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "The file is empty" });

    if (!req.body.item)
      return res.status(400).json({ message: "The item must not empty" });

    data = {};
    data.user_id = req.params.userId;
    data.item = req.body.item;
    data.file = "/" + req.file?.destination + "/" + req.file?.filename;
    const certificate = new Certificate(data);
    await certificate.save();

    certificateLogger.info(`url: ${req.originalUrl}`);

    res.json({
      message: "The certificate has been uploaded successfully.",
    });
  } catch (error) {
    certificateLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );
    res.status(500).json({ message: "There is something wrong." });
  }
};

const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.find({
      user_id: ObjectId(req.user._id),
    });

    res.json(certificate);
  } catch (error) {
    certificateLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.params.userId}`
    );
    res.status(500).json({ message: error.message });
  }
};

const editCertificate = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "The file is empty" });

    if (!req.body.item)
      return res.status(400).json({ message: "The item must not empty" });

    data = {};
    data.item = req.body.item;
    data.file = "/" + req.file?.destination + "/" + req.file?.filename;

    const certificate = await Certificate.updateOne(
      {
        _id: ObjectId(req.params.certificateId),
      },
      { $set: data }
    );

    certificateLogger.info(
      `url: ${req.originalUrl}, certificate has been updated`
    );

    res.json({
      message: "The certificate has been updated successfully.",
    });
  } catch (error) {
    certificateLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );
    res.status(500).json({ message: "There is something wrong." });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: ObjectId(req.params.certificateId),
    });

    if (!certificate) {
      return res.json({ message: "The certificate could not be found." });
    }

    const deleteCertificate = await Certificate.deleteOne({
      _id: req.params.certificateId,
    });

    res.json(deleteCertificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveCertificate,
  getCertificate,
  deleteCertificate,
  editCertificate,
  upload,
};
