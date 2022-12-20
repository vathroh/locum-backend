const MustChoose = require("../models/MustChoosePreference");

const getMustChoosePreferences = async (req, res) => {
  try {
    const device = await MustChoose.find();
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveMustChoosePreference = async (req, res) => {
  try {
    const isExists = await MustChoose.findOne({
      items: { $in: [req.query.item] },
    });
    if (isExists) return res.json(isExists);

    const mustChoosePref = new MustChoose({ items: req.query.item });
    const preferences = await mustChoosePref.save();
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPair = async (req, res) => {
  try {
    const preferences = await MustChoose.findOne({
      items: { $in: [req.query.item] },
    });

    if (preferences) {
      const pair = preferences.items.filter((item) => item !== req.query.item);
      return res.status(400).json(pair);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updatePair = async (req, res) => {
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

const deletePair = async (req, res) => {
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

module.exports = {
  getMustChoosePreferences,
  saveMustChoosePreference,
  getPair,
};
