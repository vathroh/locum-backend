const express = require("express");
const router = express.Router();

const {
    verifyEmail,
    loginWithEmail,
    registerWithFirebase,
    loginWithFirebase,
    updatePhoneNumber,
    afterSignin,
    register
} = require("../controllers/authController.js");

router.post('/register-with-firebase', registerWithFirebase);
router.post('/login-with-firebase', loginWithFirebase);
router.post('/update-phone-number/:userId', updatePhoneNumber);
router.post('/after-google-signin', afterSignin);
router.post('/verify-email', verifyEmail);
router.post('/login', loginWithEmail);
router.post('/register', register);

module.exports = router;