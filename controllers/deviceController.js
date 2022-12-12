const Device = require("../models/Device");

const getDevices = async (req, res) => {
  try {
    const device = await Device.find();
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    res.json(device);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const saveDevice = async (req, res) => {
  try {
    const isExists = await Device.findOne({
      user_id: req.body.user_id,
      device_id: req.body.device_id,
    });
    if (isExists) return res.json(isExists);

    const device = new Device(req.body);
    const savedDevice = await device.save();
    res.status(200).json(savedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDevice = async (req, res) => {
  try {
    const cekId = await Devices.findById(req.params.id);
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
    const cekId = await Device.findById(req.params.id);
    if (!cekId)
      return res
        .status(404)
        .json({ message: "The device_id can not be found." });

    const deletedDevice = await Device.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  saveDevice,
  updateDevice,
  deleteDevice,
};
