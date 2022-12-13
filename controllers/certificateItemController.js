const Certificateitem = require("../models/Certificateitem");

const getCertificateitems = async (req, res) => {
  try {
    const certificateItem = await Certificateitem.find();
    res.json(certificateItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCertificateitemById = async (req, res) => {
  try {
    const certificateItem = await Certificateitem.findById(req.params.id);
    res.json(certificateItem);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const saveCertificateitem = async (req, res) => {
  try {
    const isExists = await Certificateitem.findOne({
      user_id: req.body.user_id,
      certificateItem_id: req.body.certificateItem_id,
    });
    if (isExists) return res.json(isExists);

    const certificateItem = new Certificateitem(req.body);
    const savedCertificateitem = await certificateItem.save();
    res.status(200).json(savedCertificateitem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCertificateitem = async (req, res) => {
  try {
    const cekId = await Certificateitem.findById(req.params.id);
    if (!cekId)
      return res.status(404).json({ message: "the item  can not be found." });

    const updatedCertificateitem = await Certificateitem.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(updatedCertificateitem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCertificateitem = async (req, res) => {
  try {
    const cekId = await Certificateitem.findById(req.params.id);
    if (!cekId)
      return res.status(404).json({ message: "The item can not be found." });

    const deletedCertificateitem = await Certificateitem.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json(deletedCertificateitem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getCertificateitems,
  getCertificateitemById,
  saveCertificateitem,
  updateCertificateitem,
  deleteCertificateitem,
};
