const express = require("express");
const router = express.Router();

const {
    loginWithEmail,
    registerWithFirebase,
    loginWithFirebase,
    register
} = require("../controllers/authController.js");

router.post('/register-with-firebase', registerWithFirebase);
router.post('/login-with-firebase', loginWithFirebase);
router.post('/login', loginWithEmail);
router.post('/register', register);

module.exports = router;