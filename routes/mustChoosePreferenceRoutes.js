const router = require("express").Router();

const {
  getMustChoosePreferences,
  saveMustChoosePreference,
} = require("../controllers/mustChooseController");

router.post("/", saveMustChoosePreference);
router.get("/", getMustChoosePreferences);

module.exports = router;
