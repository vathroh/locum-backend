const express = require("express");
const router = express.Router();

const {
    register,
    login,
    signInWithGoogle,
    googleAuth
} = require("../controllers/authController.js");

router.post('/register', register);
router.post('/login', login);
router.get('/login-with-google', signInWithGoogle);
router.get('/google', googleAuth)

module.exports = router;