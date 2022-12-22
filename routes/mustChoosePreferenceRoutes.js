const router = require("express").Router();

const {
  getPair,
  getMustChoosePreferences,
  saveMustChoosePreference,
} = require("../controllers/mustChooseController");

router.get("/pairs", getPair);
router.post("/", saveMustChoosePreference);
router.get("/", getMustChoosePreferences);

module.exports = router;
