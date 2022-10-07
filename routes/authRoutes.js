const { authFirebaseMiddleware } = require('../middleware/authMiddleware')
const express = require("express");
const router = express.Router();

const {
    verifyEmail,
    loginWithEmail,
    registerWithFirebase,
    forgotEmailPassword,
    loginWithFirebase,
    updatePhoneNumber,
    updateRoleUser,
    changePassword,
    afterSignin,
    register,
    SignOut
} = require("../controllers/authController.js");

router.post('/update-phone-number/:userId', updatePhoneNumber);
router.post('/register-with-firebase', registerWithFirebase);
router.post('/email-forgot-password', forgotEmailPassword);
router.post('/login-with-firebase', loginWithFirebase);
router.post('/update-role/:userId', updateRoleUser);
router.post('/after-google-signin', afterSignin);
router.post('/change-password', changePassword);
router.post('/verify-email', verifyEmail);
router.post('/login', loginWithEmail);
router.post('/register', register);
router.post('/signout', authFirebaseMiddleware, SignOut);

module.exports = router;