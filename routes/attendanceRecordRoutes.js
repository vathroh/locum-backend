const express = require("express");
const router = express.Router();

const {
    checkin,
    checkout,
    getNewAttendance,
} = require("../controllers/attendanceRecordController.js");

router.get("/new/:jobId", getNewAttendance);
router.post("/checkout/:jobId", checkout);
router.post("/checkin/:jobId", checkin);

module.exports = router;
