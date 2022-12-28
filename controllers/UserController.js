const User = require("../models/User.js");
const Personal = require("../models/personalInormation");
const Document = require("../models/personalDocument");
const practicingDocument = require("../models/practicingInformation");
const { userLogger } = require("../services/logger/userLogger");
const { DateTime } = require("luxon");
const multer = require("multer");
const path = require("path");
const ObjectId = require("mongoose/lib/types/objectid.js");
const Preferences = require("../models/Preference");
const { listenerCount } = require("process");
const Preference = require("../models/Preference");
const { getPair } = require("../services/preferencesPair/index.js");
const { checkPair } = require("../services/preferencesPair/checkPair.js");

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
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select({
      full_name: 1,
      role_id: 1,
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

    const personalInfo = await Personal.findOne({
      user_id: user._id,
    });

    const practicing = await practicingDocument.findOne({
      user_id: user._id,
    });

    const documents = await Document.findOne({
      user_id: user._id,
    });

    const preferences = [];
    const getPreferences = user.preferences.map(async (preference) => {
      await Preference.findById(preference).then((data) => {
        preferences.push(data.item);
      });
    });

    await Promise.all(getPreferences);

    const data = {
      _id: user._id,
      role_id: user.role_id ?? "",
      full_name: user.full_name ?? "",
      profile_pict:
        user.profile_pict == "" ? "" : process.env.BASE_URL + user.profile_pict,
      phone_number: user.phone_number ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      about_me: user.about_me ?? "",
      certification: user.certification ?? [],
      preferences: preferences ?? [],
      resume: user.resume ?? "",
      achievement: user.achievement ?? [],
    };

    if (user.email_verified == false) {
      data.toPage = "email";
      // } else if (user.phone_number == "") {
      //   data.toPage = "phone_number";
    } else if (user.role == "user") {
      data.toPage = "role";
    } else if (data.role == "doctor" && !personalInfo) {
      data.toPage = "verification";
    } else if (data.role == "clinic_assistants" && !practicing) {
      data.toPage = "practicing";
    } else if (!documents) {
      data.toPage = "documents";
    } else {
      data.toPage = "dashboard";
    }

    userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

    res.json(data);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(404).json({ message: error.message });
  }
};

const saveUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

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

    userLogger.info(`url: ${req.originalUrl}, data: ${cekId._id})}`);

    res.status(200).json(updatedUser);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

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

    userLogger.info(`url: ${req.originalUrl}, data: ${cekId._id})}`);

    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const preferences = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select({
        preferences: 1,
      })
      .lean();

    if (!user)
      return res.status(400).json({ message: "User params is invalid." });

    const preferenceIds = user.preferences;

    let preferences = [];

    const promise = preferenceIds.map(async (item) => {
      let pref = await Preferences.findById(item);
      preferences.push(pref);
    });

    await Promise.all(promise);

    userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

    res.json(preferences);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(400).json({ message: error.message });
  }
};

const deletePreferences = async (req, res) => {
  try {
    const { preference_id } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(400).json({ message: "User params is invalid." });

    let preferences = user.preferences;

    preference_id.map((data) => {
      const index = preferences.indexOf(data);
      preferences.splice(index, 1);
    });

    const updatePreferences = await User.updateOne(
      { _id: ObjectId(req.params.userId) },
      { $set: { preferences: preferences } }
    );

    userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

    res.json(updatePreferences);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const postPreferences = async (req, res) => {
  try {
    const { preference_id } = req.body;
    const user = await User.findById(req.params.userId);
    const preferences = user.preferences;

    const check = await checkPair(preference_id);

    if (check?.status === 400)
      return res.status(check.status).json({ message: check.message });

    let newPreferences = [...new Set(preferences)];

    const updatePreferences = await User.updateOne(
      { _id: ObjectId(req.params.userId) },
      { $set: { preferences: newPreferences } }
    );

    userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

    res.json(updatePreferences);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const editPreferences = async (req, res) => {
  try {
    const { preference_id } = req.body;
    const user = await User.findById(req.params.userId);
    const preferences = user.preferences;

    const updatePreferences = await User.updateOne(
      { _id: ObjectId(req.params.userId) },
      { $set: { preferences: preference_id } }
    );

    userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

    res.json(updatePreferences);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const personalInformation = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "The user id not found." });

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

      userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

      res.json(updated);
    } else {
      const personal = new Personal(info);
      const saved = await personal.save();

      userLogger.info(`url: ${req.originalUrl}, data: ${user._id})}`);

      res.json(saved);
    }
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const getpersonalInformation = async (req, res) => {
  try {
    const personal = await Personal.findOne({
      user_id: req.params.userId,
    }).lean();

    if (!personal)
      return res
        .status(404)
        .json({ message: "you don't have inputed the data." });

    const dob = DateTime.fromMillis(personal.date_of_birth);
    personal.year_of_birth = dob.toFormat("yyyy");
    personal.month_of_birth = dob.toFormat("LL");
    personal.day_of_birth = dob.toFormat("dd");

    delete personal.date_of_birth;
    delete personal.createdAt;
    delete personal.updatedAt;
    delete personal.__v;

    res.status(200).json(personal);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      user_id: req.user._id,
      registration_number: registration_number,
      full_registration: full_registration,
      valid_from: from,
      valid_until: until,
    });
    const practicingInformation = await information.save();

    userLogger.info(`url: ${req.originalUrl}, data: ${req.user._id})}`);

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
    // return res.json(files.length);

    if (files.length == 0)
      return res.status(400).json({ message: "The files must not empty." });

    files.map(async (item) => {
      const file = req.files[item][0];
      const data = {};
      data.user_id = req.user._id;
      data.name = file.fieldname;
      data.file = "/" + file.path;

      const doc = new Document(data);
      const saveDoc = await doc.save();
    });
    userLogger.info(
      `url: ${req.originalUrl}, data: ${JSON.stringify(req.files)}`
    );
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

const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!req.file)
      return res.status(404).json({ message: "The file is empty" });

    profile_pict = "/" + req.file?.destination + "/" + req.file?.filename;

    await User.updateOne(
      { _id: req.params.userId },
      { $set: { profile_pict: profile_pict } }
    );

    userLogger.info(`url: ${req.originalUrl},  user:${req.user._id}`);

    res.json({
      message: "Your profile picture has been changed successfully.",
    });
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select({
      full_name: 1,
      role: 1,
      role_id: 1,
      status: 1,
    });
    res.json(user);
  } catch (error) {
    userLogger.error(
      `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
    );

    res.status(500).json({ message: error.message });
  }
};

const registrationStepNumber = async (req, res) => {
  try {
    const user = await User.findById(req.query.user_id);
    const personal = await Personal.findOne({ user_id: req.query.user_id });
    const practicing = await practicingDocument.findOne({
      user_id: req.query.user_id,
    });
    const document = await Document.findOne({ user_id: req.query.user_id });

    let step = 0;
    if (user.status === "verified") {
      step = 4;
    } else if (document) {
      step = 3;
    } else if (personal || practicing) {
      step = 2;
    } else if (user.role !== "user") {
      step = 1;
    }

    res.json({ user_id: user._id, full_name: user.full_name, step: step });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const findUser = async (req, res) => {
  try {
    const filters = {};

    if (req.query.mcr) {
      filters.mcr = req.query.mcr;
    }

    if (req.query.role_id) {
      filters.role_id = req.query.role_id;
    }

    const user = await User.findOne({ ...filters }).select({
      full_name: 1,
      email: 1,
      phone_number: 1,
      role: 1,
      role_id: 1,
      status: 1,
      profile_picture: 1,
    });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  me,
  upload,
  findUser,
  getUsers,
  saveUser,
  updateUser,
  deleteUser,
  preferences,
  getUserById,
  postPreferences,
  editPreferences,
  personalDocument,
  deletePreferences,
  personalInformation,
  updateProfilePicture,
  practicingInformation,
  registrationStepNumber,
  getpersonalInformation,
};
