const express = require("express");
const router = express.Router();

const {
  me,
  upload,
  findUser,
  getUsers,
  saveUser,
  getUserById,
  updateUser,
  deleteUser,
  preferences,
  editPreferences,
  postPreferences,
  personalDocument,
  deletePreferences,
  personalInformation,
  updateProfilePicture,
  practicingInformation,
  registrationStepNumber,
  getpersonalInformation,
} = require("../controllers/UserController.js");

const { updateUserModel } = require("../services/updateModels/user");

const {
  setBlacklist,
  setWhitelist,
  getBlacklistByClinic,
  getWhitelistByClinic,
  removeFromBlacklist,
  removeFromWhitelist,
} = require("../controllers/whitelistBlacklistController");

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

router.put(
  "/update-profile-picture/:userId",
  upload.single("profile_picture"),
  updateProfilePicture
);

router.get("/personal-information/:userId", getpersonalInformation);
router.get("/get-inclusion-by-clinic", getWhitelistByClinic);
router.get("/get-exclusion-by-clinic", getBlacklistByClinic);
router.put("/delete-preferences/:userId", deletePreferences);
router.get("/step-of-registration", registrationStepNumber);
router.put("/edit-preferences/:userId", editPreferences);
router.post("/delete-exclusion", removeFromBlacklist);
router.post("/delete-inclusion", removeFromWhitelist);
router.put("/preferences/:userId", postPreferences);
router.get("/preferences/:userId", preferences);
router.post("/update-model", updateUserModel);
router.post("/set-exclusion", setBlacklist);
router.post("/set-inclusion", setWhitelist);
router.get("/me", me);
router.get("/find", findUser);
router.delete("/:id", deleteUser);
router.patch("/:id", updateUser);
router.get("/:id", getUserById);
router.post("/", saveUser);
router.get("/", getUsers);

module.exports = router;
