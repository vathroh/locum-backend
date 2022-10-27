const router = require("express").Router();
const { syncGoogleCalendar } = require("../controllers/settingController");

router.get("/set-sync-google-calendar", syncGoogleCalendar);

module.exports = router;
