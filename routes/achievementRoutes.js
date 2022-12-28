const router = require("express").Router();

const {
  upload,
  getAchievement,
  postAchievement,
  deleteAchievement,
} = require("../controllers/achievementController");

router.get("/:userId", getAchievement);
router.delete("/:id", deleteAchievement);
router.post("/:userId", upload.single("achievement"), postAchievement);

module.exports = router;
