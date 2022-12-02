const Blacklist = require("../models/Blacklist");
const Whitelist = require("../models/Whitelist");

const setBlacklist = async (req, res) => {
  try {
    const whitelist = await Whitelist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    if (whitelist)
      return res.json({
        message:
          "The person is on the Inclusion list, please remove her/him first.",
      });

    const blacklist = await Blacklist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    const newBlacklist = new Blacklist(req.body);

    if (!blacklist) {
      const savedData = await newBlacklist.save();
      res.json({
        message: "You have successfully added this person to exclusion.",
      });
    } else {
      res.json({ message: "This person has been added to exclusion." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromBlacklist = async (req, res) => {
  try {
    const blacklist = await Blacklist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    if (!blacklist) {
      return res.status(404).json({
        message: "The person you want to remove is not found on exclusion list",
      });
    }
    const deletedUser = await Blacklist.deleteOne({ _id: blacklist.id });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBlacklistByClinic = async (req, res) => {
  try {
    const blacklist = await Blacklist.find({
      clinic_id: req.query.clinic_id,
    })
      .populate({ path: "user_id", select: "full_name" })
      .populate({ path: "added_by", select: "full_name" });

    res.json(blacklist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setWhitelist = async (req, res) => {
  try {
    const blacklist = await Blacklist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    if (blacklist)
      return res.json({
        message:
          "The person is on the Exclusion list, please remove her/him first.",
      });

    const whitelist = await Whitelist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    const newWhitelist = new Whitelist(req.body);

    if (!whitelist) {
      const savedData = await newWhitelist.save();
      res.json({
        message: "You have successfully added this person to exclusion.",
      });
    } else {
      res.json({ message: "This person has been added to exclusion." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWhitelist = async (req, res) => {
  try {
    const whitelist = await Whitelist.findOne({
      clinic_id: req.body.clinic_id,
      user_id: req.body.user_id,
    });

    if (!whitelist) {
      return res.status(404).json({
        message: "The person you want to remove is not found on exclusion list",
      });
    }
    const deletedUser = await Whitelist.deleteOne({ _id: whitelist.id });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getWhitelistByClinic = async (req, res) => {
  try {
    const whitelist = await Whitelist.find({
      clinic_id: req.query.clinic_id,
    })
      .populate({ path: "user_id", select: "full_name" })
      .populate({ path: "added_by", select: "full_name" });

    res.json(whitelist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  setBlacklist,
  setWhitelist,
  getWhitelistByClinic,
  getBlacklistByClinic,
  removeFromWhitelist,
  removeFromBlacklist,
};
