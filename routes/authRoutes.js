const express = require("express");
const router = express.Router();

const {
    registerWithFirebase,
    register,
    login
} = require("../controllers/authController.js");

router.post('/register', register);
router.post('/login', login);

module.exports = router;