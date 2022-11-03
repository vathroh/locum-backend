const express = require("express");
const router = express.Router();

const {
    upload,
    getUsers,
    saveUser,
    getUserById,
    updateUser,
    deleteUser,
    preferences,
    personalDocument,
    personalInformation,
    practicingInformation,
} = require("../controllers/UserController.js");

const { updateUserModel } = require("../services/updateModels/user");

router.post("/practicing-information/:userId", practicingInformation);
router.post("/personal-information/:userId", personalInformation);
router.post(
    "/personal-document/:userId",
    upload.fields([
        {
            name: "front_id_card",
            maxCount: 1,
        },
        {
            name: "back_id_card",
            maxCount: 1,
        },
        {
            name: "proof_of_residence",
            maxCount: 1,
        },
        {
            name: "practicing_certificate",
            maxCount: 1,
        },
    ]),
    personalDocument
);
router.get("/preferences/:userId", preferences);
router.post("/update-model", updateUserModel);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", saveUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
