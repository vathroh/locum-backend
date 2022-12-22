const router = require("express").Router();

const {
    upload,
    getAchievement,
    postAchievement,
} = require("../controllers/achievementController");

router.get("/:userId", getAchievement);
router.post("/:userId", upload.single("achievement"), postAchievement);

module.exports = router;
