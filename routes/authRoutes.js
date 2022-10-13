const { authFirebaseMiddleware } = require('../middleware/authMiddleware')
const express = require("express");
const router = express.Router();

const {
    verifyEmail,
    loginWithEmail,
    registerWithFirebase,
    changeFirebasePasswordByUser,
    forgotEmailPassword,
    loginWithFirebase,
    updatePhoneNumber,
    updateRoleUser,
    afterSignin,
    register
} = require("../controllers/authController.js");

router.post('/change-password-by-user', authFirebaseMiddleware, changeFirebasePasswordByUser);
router.post('/update-phone-number/:userId', authFirebaseMiddleware, updatePhoneNumber);
router.post('/update-role/:userId', authFirebaseMiddleware, updateRoleUser);
router.post('/after-google-signin', authFirebaseMiddleware, afterSignin);
router.post('/register-with-firebase', registerWithFirebase);
router.post('/email-forgot-password', forgotEmailPassword);
router.post('/login-with-firebase', loginWithFirebase);
router.post('/verify-email', verifyEmail);
router.post('/login', loginWithEmail);
router.post('/register', register);

module.exports = router;