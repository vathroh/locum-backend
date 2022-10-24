const axios = require("axios");
const bcrypt = require("bcrypt");
const { json } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const { sendingSMS } = require("../services/sendSMS");
const client = require("twilio")(accountSid, authToken);
const { sendingEmail } = require("../services/sendingEmail");

const sendEmailVerificationCode = async (req, res) => {
    const user = User.findOne({ email: req.body.email });
    code = Math.random().toString().substr(2, 6);
    user.verification_code = code;

    user.updateOne({ email: req.body.email }, { $set: user });

    subject = "Please verify your email address.";
    text = `${code} is your email verification code. Please input the code to the form to activate your account!`;
    html = null;

    sendingEmail(req.body.email, subject, text, html);
};

const sendEmailForgotPasswordCode = async (req, res) => {
    const user = User.findOne({ email: req.body.email });
    code = Math.random().toString().substr(2, 6);
    user.forgot_password_code = code;

    user.updateOne({ email: req.body.email }, { $set: user });

    subject = "Please verify your email address.";
    text = `${code} is your email verification code. Please input the code to the form to activate your account!`;
    html = null;

    sendingEmail(req.body.email, subject, text, html);
};

const changePasswordByUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (await bcrypt.compare(req.body.current_password, user.password)) {
            user.password = await bcrypt.hash(req.body.new_password, 10);
            await User.updateOne({ _id: user._id }, { $set: user });
            res.json({ message: "Successfully changed the password." });
        } else {
            return res.status(400).json({
                message: "Please insert the correct current password!",
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.nessage });
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

const register = async (req, res) => {
    try {
        const encryptedPassword = await bcrypt.hash(req.body.password, 10);
        code = Math.random().toString().substr(2, 6);
        req.body.password = encryptedPassword;
        req.body.email_verification_code = code;
        const user = new User(req.body);
        await user.save();

        subject = "Please verify your email address.";
        text = `${code} is your email verification code. Please input the code to the form to activate your account!`;
        html = null;

        sendingEmail(req.body.email, subject, text, html);

        res.status(200).json({
            message:
                "Your verification code has been successfully sent to your email. Please verify to activate your account!",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { email, verification_code } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.json({
            message:
                "Your email is not recorded in our database. Pelase register this email!",
        });
    }

    user.status = "activated";
    user.email_verified = true;

    if (req.body.verification_code == user.email_verification_code) {
        await User.updateOne({ _id: user._id }, { $set: user });

        const auth = {};
        auth._id = user._id;
        auth.full_name = user.full_name;
        auth.email = user.email;
        auth.role = user.role;
        auth.phone_number = user.phone_number ?? "";
        auth.profile_pict = user.profile_pict ?? "";

        const accessToken = generateAccessToken(JSON.stringify(user));
        const refreshToken = jwt.sign(
            JSON.stringify(user),
            process.env.REFRESH_TOKEN_SECRET
        );

        return res.status(200).json({
            user: auth,
            idToken: accessToken,
            refreshToken: refreshToken,
        });
    } else {
        res.status(500).json({ message: "Please input the correct code!" });
    }
};

const sendPhoneVerificationCode = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        code = Math.random().toString().substr(2, 6);
        user.phone_verification_code = code;
        await User.updateOne({ _id: user._id }, { $set: user });
        const text = `LOCUM. ${code} is your verification code. please input to verify your phone number!`;

        client.messages
            .create({
                body: text,
                from: "+13608001799",
                to: req.body.phone_number,
            })
            .then((message) => {
                console.log(message.sid);
                res.json(message);
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    // try {

    //     sendingSMS(text, req.body.phone_number);

    //     res.status(200).json({
    //         message:
    //             "We have sent verification code to your phone. please verify to add your phone number!",
    //     });
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }
};

const verifyPhoneNumber = async (req, res) => {
    if (req.body.code == "") {
        return res.status(400).json({
            message: "You have to input code we sent to your phone.",
        });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.json({
                message: `User with id ${req.user._id} has not found`,
            });
        }

        user.phone_number_verified = true;
        user.phoneNumber = req.body.phone_number;

        if (user.phone_verification_code === req.body.code) {
            await User.updateOne({ _id: user._id }, { $set: user });
            res.json({ message: "Your phone number has been verified." });
        } else {
            res.status(400).json({ message: "You input incorrect code." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    if (req.body.emailOrPhoneNumber == "") {
        return res
            .status(400)
            .json({ message: "Please input email or phone number!" });
    } else if (req.body.password == "") {
        return res.status(400).json({ message: "Password is required!" });
    }

    if (ValidateEmail(req.body.emailOrPhoneNumber)) {
        req.body.email = req.body.emailOrPhoneNumber;
    } else if (validatePhoneNumber) {
        req.body.phone_number = req.body.emailOrPhoneNumber;
    } else {
        return res
            .status(400)
            .json({ message: "Please input valid email or phone number!" });
    }

    const findUser = await User.findOne({
        $or: [{ email: req.body.email }, { phone_number: req.body.email }],
    }).lean();

    if (!findUser) {
        return res.status(400).json("Wrong email or phone number!");
    }

    if (findUser.email_verified === false) {
        return res
            .status(403)
            .json(
                "Your account has not been activated. Please verify your email to activate it!"
            );
    } else {
        try {
            if (await bcrypt.compare(req.body.password, findUser.password)) {
                const user = {};
                user._id = findUser._id;
                user.full_name = findUser.full_name;
                user.email = findUser.email;
                user.role = findUser.role;
                user.phone_number = findUser.phone_number ?? "";
                user.profile_pict = findUser.profile_pict ?? "";

                const accessToken = generateAccessToken(JSON.stringify(user));
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
                return res
                    .status(400)
                    .json({ message: "Invalid credentials!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Something wrong." });
        }
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

function ValidateEmail(string) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(string)) {
        return true;
    }
    return false;
}

function validatePhoneNumber(input_str) {
    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    return re.test(input_str);
}

const forgotPassword = (req, res) => {
    res.json("halo");
};

module.exports = {
    login,
    register,
    refreshToken,
    verifyEmail,
    sendEmailVerificationCode,
    updatePhoneNumber,
    changePasswordByUser,
    updateRoleUser,
    forgotPassword,
    sendPhoneVerificationCode,
    verifyPhoneNumber,
};
