const router = require("express").Router();

const {
    upload,
    getResume,
    saveResume,
} = require("../controllers/resumeController");

router.get("/:userId", getResume);

router.post("/:userId", upload.single("resume"), saveResume);

module.exports = router;
