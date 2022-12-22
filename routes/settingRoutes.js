const router = require("express").Router();
const {
  syncGoogleCalendar,
  setSetting,
  getSetting,
} = require("../controllers/settingController");

router.get("/set-sync-google-calendar", syncGoogleCalendar);
router.post("/", setSetting);
router.get("/", getSetting);

module.exports = router;
