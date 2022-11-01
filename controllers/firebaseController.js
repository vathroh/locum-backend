const { initializeApp } = require("firebase/app");
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

const firebaseConfig = {
    apiKey: "AIzaSyAJMrnCOVifTBjIj4xv5rsxnDMQsgXzBS4",
    authDomain: "locumsg-82094.firebaseapp.com",
    projectId: "locumsg-82094",
    storageBucket: "locumsg-82094.appspot.com",
    messagingSenderId: "868654243090",
    appId: "1:868654243090:web:4dbde59e391fb6d82a67cb",
    measurementId: "G-BMJF0EBZ33",
};

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "it";

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
            data.verification_code = Math.random().toString().substr(2, 6);
            const newUser = new User(data);

            try {
                const savedUser = await newUser.save();

                axios({
                    method: "POST",
                    url: process.env.BASE_URL + "/send/email",
                    data: {
                        email: req.body.email,
                        subject: "Please verify your email address",
                        text: data.verification_code,
                    },
                });

                admin
                    .auth()
                    .updateUser(result.uid, {
                        disabled: true,
                    })
                    .then(() => {
                        res.json({
                            message:
                                "Your verification code has been successfully sent to your email. Please verify before login.",
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: err });
                    });
            } catch (error) {
                res.status(500).json({ message: error });
            }
        })
        .catch((error) => {
            console.log(error);
            res.json(error.message);
        });
};

const sendingVerificationCode = async (req, res) => {
    const user = User.findOne({ email: req.body.email });
    user.verification_code = Math.random().toString().substr(2, 6);

    user.updateOne({ email: req.body.email }, { $set: user });

    axios({
        method: "POST",
        url: "http://localhost:5000/send/email",
        data: {
            email: req.body.email,
            subject: "Please verify your email address",
            text: verification_code,
        },
    })
        .then(() => {
            res.json({
                message:
                    "Verification code has been sent to your email. Please check your email",
            });
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
};

const loginWithFirebase = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (user) {
        await admin
            .auth()
            .getUser(user.firebaseUUID)
            .then((userRecord) => {
                if (userRecord.emailVerified == false) {
                    return res.status(401).json({
                        message:
                            "Your email is not verified. Please check your email.",
                    });
                }
            })
            .catch((error) => {
                return res.status(500).json({ message: error.message });
            });
    }

    await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCred) => {
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

                return res.json({
                    user: user,
                    idToken: userCred._tokenResponse.idToken,
                    refreshToken: userCred._tokenResponse.refreshToken,
                });
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
                    return res.json({
                        user: user,
                        idToken: userCred._tokenResponse.idToken,
                        refreshToken: userCred._tokenResponse.refreshToken,
                    });
                } catch (error) {
                    return res.status(500).json({ message: error.message });
                }
            }
        })
        .catch((err) => {
            return res.status(401).json({ message: "Invalid credentials!" });
        });
};

const afterGoogleSignin = async (req, res) => {
    const findUser = await User.findOne({ firebaseUUID: req.body.uid });

    if (findUser) {
        res.json({
            user: findUser,
            idToken: req.body.idToken,
            refreshToken: req.body.refreshToken,
        });
    } else {
        const data = {};
        data.firebaseUUID = req.body.uid;
        data.full_name = req.body.displayName;
        data.email = req.body.email;
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

                return res.json(jwt);
            } else {
                return res.status(500).json({ message: "Server error!" });
            }
        } catch (error) {
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
        user: auth,
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

const changePasswordByUser = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (await bcrypt.compare(req.body.current_password, user.password)) {
        user.password = await bcrypt.hash(req.body.new_password, 10);

        res.json({ message: "Successfully changed the password." });
    } else {
        return res
            .status(400)
            .json({ message: "Please insert the correct current password!" });
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
    const userId = await User.findById(req.params.userId);
    if (!userId)
        return res.status(404).json({ message: "The user is not found." });
    userId.role = req.body.role;

    try {
        const updatedUser = await User.updateOne(
            { _id: req.params.userId },
            { $set: userId }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const findOrCreateUser = async (userCred) => {
    const user = {};
    const findUser = await User.findOne({ firebaseUUID: userCred.user.uid });

    if (findUser) {
        user._id = findUser._id;
        user.full_name = findUser.full_name;
        user.role = findUser.role;
        user.phone_number = findUser.phone_number ?? "";
        user.profile_pict = findUser.profile_pict ?? "";

        return res.json({
            user: user,
            idToken: userCred._tokenResponse.idToken,
            refreshToken: userCred._tokenResponse.refreshToken,
        });
    } else {
        const data = {};
        data.firebaseUUID = userCred.user.uid;
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
            return res.json({
                user: user,
                idToken: userCred._tokenResponse.idToken,
                refreshToken: userCred._tokenResponse.refreshToken,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    //     .catch ((err) => {
    // return res.status(401).json({ message: "Invalid credentials!" })
};

const verifyIdToken = (req, res) => {
    const token = req.headers.authorization
        ? req.headers.authorization.split(" ")
        : null;
    if (!token) {
        res.json("You are not logged in!");
    } else {
        admin
            .auth()
            .verifyIdToken(token[1])
            .then((decodedToken) => {
                // const uid = decodedToken.uid;
                console.log(decodedToken);
                // console.log(uid)
                // ...
                res.json("good1");
            })
            .catch((error) => {
                // Handle error
                res.json(error);
            });
    }
};

const register = async (req, res) => {
    // if (req.body.full_name == "") {
    //     return res.status(400).json({ message: "Please enter your name!" })

    if (req.body.email == "") {
        return res.status(400).json({ message: "Email is required!" });
    } else if (req.body.password == "") {
        return res.status(400).json({ message: "Password is required!" });
    }
    // } else if (req.body.confirm_password == "") {
    //     return res.status(400).json({ message: "Please confirm the password!" })
    // } else if (req.body.password !== req.body.confirm_password) {
    //     return res.status(400).json({ message: 'The password are not match!' })
    // }

    try {
        ValidateEmail(req, res);
        const encryptedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = encryptedPassword;

        const user = new User(req.body);

        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginWithEmail = async (req, res) => {
    const findUser = await User.findOne({ email: req.body.email }).lean();

    if (!findUser) {
        return res.status(400).json("Wrong email or please register!");
    }

    try {
        if (await bcrypt.compare(req.body.password, findUser.password)) {
            const user = {};
            user._id = findUser._id;
            user.full_name = findUser.full_name;
            user.email = findUser.email;
            user.role = findUser.role;
            user.phone_number = findUser.phone_number ?? "";
            user.profile_pict = findUser.profile_pict ?? "";

            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(
                user,
                process.env.REFRESH_TOKEN_SECRET
            );

            return res.status(200).json({
                user: user,
                idToken: accessToken,
                refreshToken: refreshToken,
            });
        } else {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something wrong." });
    }
};

const verifyEmail = async (req, res) => {
    const { email, verification_code } = req.body;
    const user = await User.findOne({ email: email });

    user.status = "Activated";

    if (verification_code == user.verification_code) {
        await User.updateOne({ _id: user._id }, { $set: user });

        admin
            .auth()
            .updateUser(user.firebaseUUID, {
                disabled: false,
                emailVerified: true,
            })
            .then(() => {
                res.json({ message: "Your acoount has been verified." });
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    } else {
        res.status(500).json({ message: "Something wrong." });
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
    res.status(400).json("You have entered an invalid email address!");
    return false;
}

const forgotEmailPassword = (req, res) => {
    const auth = getAuth();
    auth.languageCode = "en";
    sendPasswordResetEmail(auth, req.body.email)
        .then(() => {
            res.json({
                message:
                    "We have sent link to your email, Please check your email.",
            });
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
};

const SignOut = (req, res) => {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
            res.json({ message: "You have successfully logged out." });
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
};

module.exports = {
    register,
    loginWithFirebase,
    registerWithFirebase,
    loginWithEmail,
    refreshToken,
    verifyEmail,
    sendingVerificationCode,
    afterGoogleSignin,
    updatePhoneNumber,
    updateRoleUser,
    forgotEmailPassword,
    SignOut,
    changeFirebasePasswordByUser,
};
