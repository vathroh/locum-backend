const { authJwtMiddleware } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
    login,
    register,
    forgotPassword,
    updateRoleUser,
    verifyPhoneNumber,
    updatePhoneNumber,
    changePasswordByUser,
    sendPhoneVerificationCode,
} = require("../controllers/authController.js");

const {
    verifyEmail,
    afterGoogleSignin,
    loginWithFirebase,
    registerWithFirebase,
    sendingEmailVerificationCode,
} = require("../controllers/firebaseController");

router.post(
    "/change-password-by-user",
    authJwtMiddleware,
    changePasswordByUser
);

router.post(
    "/update-phone-number/:userId",
    authJwtMiddleware,
    updatePhoneNumber
);

router.post(
    "/send-phone-verification/:userId",
    authJwtMiddleware,
    sendPhoneVerificationCode
);

router.post("/send-email-verification/:userId", sendingEmailVerificationCode);

router.post("/verify-phone-number", authJwtMiddleware, verifyPhoneNumber);
router.post("/update-role/:userId", authJwtMiddleware, updateRoleUser);
router.post("/after-google-signin", afterGoogleSignin);
router.post("/email-forgot-password", forgotPassword);
router.post("/register", registerWithFirebase);
router.post("/verify-email", verifyEmail);
router.post("/login", loginWithFirebase);
// router.post("/register", register);
// router.post("/login", login);

module.exports = router;
