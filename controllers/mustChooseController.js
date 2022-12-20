const MustChoose = require("../models/MustChoosePreference");

const getMustChoosePreferences = async (req, res) => {
  try {
    const device = await MustChoose.find();
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMustChoosePreferencesByItem = async (req, res) => {
  try {
    const device = await MustChoose.find();
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveMustChoosePreference = async (req, res) => {
  //   return res.json(req.query);
  try {
    const isExists = await MustChoose.findOne({
      items: req.query.item,
    });
    if (isExists) return res.json(isExists);

    const mustChoosePref = new MustChoose({ items: req.query.item });
    const preferences = await mustChoosePref.save();
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const device = await MustChoose.findById(req.params.id);
    res.json(device);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateDevice = async (req, res) => {
  try {
    const cekId = await MustChoose.findById(req.params.id);
    if (!cekId)
      return res
        .status(404)
        .json({ message: "the devie id can not be found." });
    const updatedDevice = await Device.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const cekId = await MustChoose.findById(req.params.id);
    if (!cekId)
      return res
        .status(404)
        .json({ message: "The device_id can not be found." });

    const deletedDevice = await MustChoose.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMustChoosePreferences, saveMustChoosePreference };
