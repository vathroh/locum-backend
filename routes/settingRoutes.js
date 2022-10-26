const router = require("express").Router();
const { setSyncGoogleCalendar } = require("../controllers/settingController");

router.get("/set-sync-google-calendar", setSyncGoogleCalendar);

module.exports = router;
