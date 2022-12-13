const router = require("express").Router();

const {
  saveEventByAPI,
  getEventByUserId,
  get3DaysEventByUserId,
  getEventsByUserByMonth,
} = require("../controllers/calendarController");

router.get("/get-events-by-user", getEventsByUserByMonth);
router.get("/3day/:userId", get3DaysEventByUserId);
router.get("/:userId", getEventByUserId);
router.post("/", saveEventByAPI);

module.exports = router;
