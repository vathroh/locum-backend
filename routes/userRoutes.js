const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser,
    preferences,
} = require("../controllers/UserController.js");

const { updateUserModel } = require("../services/updateModels/user");

router.get("/preferences/:userId", preferences);
router.post("/update-model", updateUserModel);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", saveUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
