const { authJwtMiddleware } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
    changeFirebasePasswordByUser,
    sendPhoneVerificationCode,
    forgotEmailPassword,
    verifyPhoneNumber,
    updatePhoneNumber,
    updateRoleUser,
    verifyEmail,
    afterSignin,
    register,
    login,
} = require("../controllers/authController.js");

router.post(
    "/change-password-by-user",
    authJwtMiddleware,
    changeFirebasePasswordByUser
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

router.post("/verify-phone-number", authJwtMiddleware, verifyPhoneNumber);
router.post("/update-role/:userId", authJwtMiddleware, updateRoleUser);
router.post("/after-google-signin", authJwtMiddleware, afterSignin);
router.post("/email-forgot-password", forgotEmailPassword);
router.post("/verify-email", verifyEmail);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
