const { initializeApp } = require("firebase/app");
const { sendingEmail } = require("../services/sendingEmail");
const admin = require("firebase-admin");
const {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signOut,
} = require("firebase/auth");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { authLogger } = require("../services/logger/authLogger");
const personalInormation = require("../models/personalInormation");
const practicingInformation = require("../models/practicingInformation");
const personalDocument = require("../models/personalDocument");
const { json } = require("express");
const { DateTime } = require("luxon");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// auth.languageCode = "it";

const registerWithFirebase = async (req, res) => {
  const userResponse = await admin
    .auth()
    .createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: false,
      disabled: false,
    })
    .then(async (result) => {
      const data = {};
      data.email = result.email;
      data.password = await bcrypt.hash(req.body.password, 10);
      data.firebaseUUID = result.uid;
      data.email_verification_code = Math.random().toString().substr(2, 6);
      const newUser = new User(data);

      try {
        const savedUser = await newUser.save();

        sendingEmail(
          req.body.email,
          "Please verify your email address",
          `${data.email_verification_code} is your email verification code. Please input the code to the form to activate your account!`,
          null
        );

        authLogger.info(
          `url: ${req.originalUrl}, ${req.body.email} has been registered.`
        );
        res.json({
          message:
            "Your verification code has been successfully sent to your email. Please verify before login.",
        });
      } catch (error) {
        authLogger.error(
          `url: ${req.originalUrl}, ${error.message}, email: ${req.body.email}`
        );
        res.status(500).json({ message: error.message });
      }
    })
    .catch((error) => {
      authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
      res.status(500).json(error.message);
    });
};

const clinicAdminRegister = async (req, res) => {
  const userResponse = await admin
    .auth()
    .createUser({
      email: req.body.email,
      password: "Default-password",
      emailVerified: false,
      disabled: false,
    })
    .then(async (result) => {
      const data = {};
      data.email = result.email;
      data.full_name = req.body.full_name;
      data.password = await bcrypt.hash("Default-password", 10);
      data.firebaseUUID = result.uid;
      data.email_verification_code = Math.random().toString().substr(2, 6);
      const newUser = new User(data);

      try {
        const savedUser = await newUser.save();

        sendingEmail(
          req.body.email,
          "Please verify your email address",
          `${data.email_verification_code} is your email verification code. Please input the code to the form to activate your account!`,
          null
        );

        admin
          .auth()
          .updateUser(result.uid, {
            disabled: true,
          })
          .then(() => {
            authLogger.info(
              `url: ${req.originalUrl}, ${req.body.email} has been registered.`
            );
            res.json({
              message:
                "Your verification code has been successfully sent to your email. Please verify to complete the sign up.",
            });
          })
          .catch((err) => {
            authLogger.error(
              `url: ${req.originalUrl}, ${err.message}, email: ${req.body.email}`
            );
            res.status(500).json({ message: err.message });
          });
      } catch (error) {
        authLogger.error(
          `url: ${req.originalUrl}, ${error.message}, email: ${req.body.email}`
        );
        res.status(500).json({ message: error.message });
      }
    })
    .catch((error) => {
      authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
      res.json(error.message);
    });
};

const changeClininAdminPasswordByAdmin = async (req, res) => {
  if (!req.body.password)
    return res.status(400).json({ message: "Password must not be empty." });

  const passwordValidation = ValidatePassword(req, res);

  if (!passwordValidation)
    return res.status(400).json({
      message:
        "Password must contain min 8 character, with at least a symbol, upper and lower case letters and a number",
    });

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(500).json({
      message: "Your account can not be found. Please register again.",
    });

  const password = await bcrypt.hash(req.body.password, 10);
  await User.updateOne(
    { email: req.body.email },
    { $set: { password: password } }
  );

  await admin
    .auth()
    .updateUser(user.firebaseUUID, {
      password: req.body.password,
    })
    .then(async (userRecord) => {
      await User.updateOne({ _id: user._id }, { $set: user });
      res.json({ message: "Successfully changed the password." });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

const sendingEmailVerificationCode = async (req, res) => {
  if (!req.body.email)
    return res.status(500).json({ message: "The email must not empty." });

  try {
    const user = await User.findOne({ email: req.body.email });
    const email_verification_code = Math.random().toString().substr(2, 6);

    await User.updateOne(
      { email: req.body.email },
      { $set: { email_verification_code: email_verification_code } }
    );

    sendingEmail(
      req.body.email,
      "Please verify your email address",
      `${email_verification_code} is your email verification code. Please input the code to the form to activate your account!`,
      null
    );

    authLogger.info(
      `url: ${req.originalUrl}, Email verification has been sent to ${req.body.email}.`
    );

    res.json({
      message:
        "Verification code has been sent to your email. Please check your email",
    });
  } catch (error) {
    authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
    res.status(500).json({ message: "There is something wrong." });
  }
};

const verifyEmail = async (req, res) => {
  const { email, verification_code } = req.body;
  const user = await User.findOne({ email: email });

  user.status = "Activated";
  user.email_verified = true;

  authLogger.info(
    `url: ${req.originalUrl}, process verification ${
      req.body.email
    } begin. data: ${JSON.stringify(req.body)} user:${JSON.stringify(user)}`
  );

  if (verification_code == user.email_verification_code) {
    await User.updateOne({ _id: user._id }, { $set: user });

    admin
      .auth()
      .updateUser(user.firebaseUUID, {
        disabled: false,
        emailVerified: true,
      })
      .then(async () => {
        authLogger.info(
          `url: ${req.originalUrl}, ${req.body.email} has been verified.`
        );
        const currentUser = {};
        currentUser._id = user._id ?? "";
        currentUser.email = user.email ?? "";
        currentUser.full_name = user.full_name ?? "";
        currentUser.role = user.role ?? "";
        currentUser.phone_number = user.phone_number ?? "";
        currentUser.profile_pict = user.profile_pict ?? "";

        const jwt = jwtObject(currentUser);

        req.session.isBolehMasuk = true;
        req.session.idToken = jwt.idToken;
        req.session.refreshToken = jwt.refreshToken;

        authLogger.info(`url: ${req.originalUrl}, ${user._id} is logging in.`);
        res.json(jwt);
      })
      .catch((error) => {
        authLogger.info(`url: ${req.originalUrl}, ${error.message}`);
        res.status(500).json({
          message: "There is something wrong.",
        });
      });
  } else {
    authLogger.error(`url: ${req.originalUrl}, wrong verification code `);
    res.status(500).json({
      message: "You input wrong verification code.",
    });
  }
};

const loginWithFirebase = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    const isEmailVerified = true;
    if (user) {
      await admin
        .auth()
        .getUser(user.firebaseUUID)
        .then(async (userRecord) => {
          if (userRecord.emailVerified == false) {
            isEmailVerified = false;
          }
        });
    }

    if (isEmailVerified == true) {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCred) => {
          const cred = await getUser(userCred, req);

          req.session.isBolehMasuk = true;
          req.session.idToken = cred.idToken;
          req.session.refreshToken = cred.refreshToken;

          return res.json(cred);
        })
        .catch((error) => {
          authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
          return res.status(401).json({ message: "Invalid credentials!" });
        });
    } else {
      authLogger.info(`url: ${req.originalUrl}, Email is not verified.`);
      return res.status(401).json({
        message: "Your email is not verified. Please check your email.",
      });
    }
  } catch (error) {
    authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

const getUser = async (userCred, req) => {
  const user = {};
  const findUser = await User.findOne({
    firebaseUUID: userCred.user.uid,
  });

  if (findUser) {
    user._id = findUser._id;
    user.full_name = findUser.full_name;
    user.role = findUser.role;
    user.phone_number = findUser.phone_number ?? "";
    user.profile_pict = findUser.profile_pict ?? "";

    findUser.password = await bcrypt.hash(req.body.password, 10);
    await User.updateOne({ _id: findUser._id }, { $set: findUser });

    const jwt = jwtObject(user);
    authLogger.info(`url: ${req.originalUrl}, ${user._id} is logging in.`);
    return jwt;
  } else {
    const data = {};
    data.firebaseUUID = userCred.user.uid;
    data.password = await bcrypt.hash(req.body.password, 10);
    data.full_name = userCred._tokenResponse.displayName;
    data.email = userCred._tokenResponse.email;
    data.phone_number = userCred._tokenResponse.phoneNumber;

    const newUser = new User(data);

    try {
      const savedUser = await newUser.save();
      const user = {};
      const findUser = await User.findOne({
        firebaseUUID: userCred.user.uid,
      });

      if (findUser) {
        user._id = findUser._id;
        user.email = findUser.email;
        user.full_name = findUser.full_name;
        user.role = findUser.role;
        user.phone_number = findUser.phone_number ?? "";
        user.profile_pict = findUser.profile_pict ?? "";
      }

      const jwt = jwtObject(user);
      authLogger.info(`url: ${req.originalUrl}, ${user._id} is logging in.`);
      return jwt;
    } catch (error) {
      authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
    }
  }
};

const afterGoogleSignin = async (req, res) => {
  try {
    let toPage = "dashboard";
    const findUser = await User.findOne({ firebaseUUID: req.body.uid });

    if (findUser) {
      const personal = await personalInormation.findOne({
        user_id: findUser._id,
      });

      const practicing = await practicingInformation.findOne({
        user_id: findUser._id,
      });

      const documents = await personalDocument.findOne({
        user_id: findUser._id,
      });

      // return res.json(personal);
      console.log(personal);

      const user = {};
      user._id = findUser._id;
      user.email = findUser.email;
      user.full_name = findUser.full_name;
      user.role = findUser.role;
      user.phone_number = findUser.phone_number ?? "";
      user.profile_pict = findUser.profile_pict ?? "";

      if (user.email_verified == false) {
        toPage = "email";
      } else if (user.phone_number == "") {
        toPage = "phone_number";
      } else if (user.role == "user") {
        toPage = "role";
      } else if (!personal) {
        toPage = "verification";
      } else if (!practicing) {
        toPage = "practicing";
      } else if (!documents) {
        toPage = "documents";
      } else {
        toPage = "dashboard";
      }

      const jwt = jwtObject(user);
      jwt.toPage = toPage;

      req.session.isBolehMasuk = true;
      req.session.idToken = jwt.idToken;
      req.session.refreshToken = jwt.refreshToken;

      authLogger.info(`url: ${req.originalUrl}, ${user._id} is logging in.`);
      return res.json(jwt);
    } else {
      authLogger.info(
        `url: ${req.originalUrl}, there is no account with this google, please sign up..`
      );
      return res.status(500).json({
        message: `Your account has not been registered, please sign up!`,
        status: "unregistered",
      });
    }
  } catch (error) {
    authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
    return res
      .status(500)
      .json({ message: error.message, status: "unregistered" });
  }
};

const afterGoogleSignup = async (req, res) => {
  const findUser = await User.findOne({ firebaseUUID: req.body.uid });

  if (findUser) {
    authLogger.info(
      `url: ${req.originalUrl}, The account has been registered.`
    );
    res.status(500).json({
      message: `"${findUser.email}" has been registered. Please sign in.`,
      status: "registered",
    });
  } else {
    const data = {};
    data.firebaseUUID = req.body.uid;
    data.full_name = req.body.displayName;
    data.email = req.body.email;
    data.email_verified = true;
    data.phone_number = req.body.phoneNumber ?? "";

    const newUser = new User(data);

    try {
      const savedUser = await newUser.save();
      const findUseragain = savedUser;

      if (findUseragain) {
        const user = {};

        user._id = findUseragain._id;
        user.email = findUseragain.email;
        user.full_name = findUseragain.full_name;
        user.role = findUseragain.role;
        user.phone_number = findUseragain.phone_number ?? "";
        user.profile_pict = findUseragain.profile_pict ?? "";

        const jwt = jwtObject(user);

        req.session.isBolehMasuk = true;
        req.session.idToken = jwt.idToken;
        req.session.refreshToken = jwt.refreshToken;

        authLogger.info(`url: ${req.originalUrl}, ${user._id} is logging in.`);
        return res.json(jwt);
      } else {
        authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    } catch (error) {
      authLogger.error(`url: ${req.originalUrl}, ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }
};

const jwtObject = (user) => {
  const accessToken = generateAccessToken(JSON.stringify(user));
  const refreshToken = jwt.sign(
    JSON.stringify(user),
    process.env.REFRESH_TOKEN_SECRET
  );

  return {
    user: user,
    idToken: accessToken,
    refreshToken: refreshToken,
  };
};

const changeFirebasePasswordByUser = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (await bcrypt.compare(req.body.current_password, user.password)) {
    user.password = await bcrypt.hash(req.body.new_password, 10);
    await admin
      .auth()
      .updateUser(user.firebaseUUID, {
        password: req.body.new_password,
      })
      .then(async (userRecord) => {
        await User.updateOne({ _id: user._id }, { $set: user });
        res.json({ message: "Successfully changed the password." });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } else {
    return res
      .status(400)
      .json({ message: "Please insert the correct current password!" });
  }
};

const changeFirebasePasswordByAdmin = async (req, res) => {
  if (req.user.role === "system admin") {
    const user = await User.findById(req.body.user_id);
    user.password = await bcrypt.hash(req.body.new_password, 10);

    await admin
      .auth()
      .updateUser(user.firebaseUUID, {
        password: req.body.new_password,
      })
      .then(async (userRecord) => {
        await User.updateOne({ _id: user._id }, { $set: user });
        res.json({ message: "Successfully changed the password." });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(403).json({
      message: "You are not allowed to change the user password.",
    });
  }
};

const updatePhoneNumber = async (req, res) => {
  const userId = await User.findById(req.params.userId);
  if (!userId)
    return res.status(404).json({ message: "The user is not found." });
  userId.phone_number = req.body.phone_number;

  try {
    const updatedUser = await User.updateOne(
      { _id: req.params.userId },
      { $set: userId }
    );

    await admin
      .auth()
      .updateUser(userId.firebaseUUID, {
        phoneNumber: req.body.phone_number,
      })
      .then(() => {})
      .catch((err) => {});
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoleUser = async (req, res) => {
  const { role } = req.body;
  try {
    const userId = await User.findById(req.params.userId);
    if (!userId)
      return res.status(404).json({ message: "The user is not found." });

    const now = DateTime.now()
      .setZone("Asia/Singapore")
      .toFormat("yyLLdd")
      .toString();

    userId.role = role;

    const startOfDay = DateTime.now().setZone("Asia/Singapore").startOf("day");

    const endOfDay = DateTime.now().setZone("Asia/Singapore").endOf("day");

    if (role == "doctor") {
      const count = await User.find({
        role: "doctor",
        createdAt: { $lte: endOfDay, $gte: startOfDay },
      }).count();

      const number = parseInt(count) + 1;
      const string = "LOC-" + now + "000";
      const code = string.slice(0, 14 - number) + number;

      userId.role_id = code;
    } else if (role == "clinic_assistants") {
      const count = await User.find({
        role: "clinic_assistants",
        createdAt: { $lte: endOfDay, $gte: startOfDay },
      }).count();

      const number = parseInt(count) + 1;
      const string = "CLA-" + now + "000";
      const code = string.slice(0, 14 - number) + number;

      userId.role_id = code;
    }

    const updatedUser = await User.updateOne(
      { _id: req.params.userId },
      { $set: userId }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshToken.includes(refreshToken)) return res.sendStatus(403);
};

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

function ValidateEmail(req, res) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
    return true;
  }
  // res.status(400).json("You have entered an invalid email address!");
  return false;
}

function ValidatePassword(req, res) {
  if (
    /^(?=.*\d)(?=.*[!@#$%^&*()-])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
      req.body.password
    )
  ) {
    return true;
  }
  return false;
}

const forgotEmailPassword = (req, res) => {
  const auth = getAuth();
  auth.languageCode = "en";
  sendPasswordResetEmail(auth, req.body.email)
    .then(() => {
      res.json({
        message: "We have sent link to your email, Please check your email.",
      });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

module.exports = {
  changeClininAdminPasswordByAdmin,
  changeFirebasePasswordByUser,
  sendingEmailVerificationCode,
  registerWithFirebase,
  forgotEmailPassword,
  clinicAdminRegister,
  afterGoogleSignin,
  loginWithFirebase,
  updatePhoneNumber,
  afterGoogleSignup,
  updateRoleUser,
  refreshToken,
  verifyEmail,
};
