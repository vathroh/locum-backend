const express = require("express");
const router = express.Router();

const {
  checkin,
  checkout,
  afterCheckout,
  checkinByAdmin,
  checkoutByAdmin,
  getNewAttendance,
  getAppointmentUserByDay,
} = require("../controllers/attendanceRecordController.js");

router.get("/user-appointment-by-day", getAppointmentUserByDay);
router.post("/checkout-by-admin/:jobId", checkoutByAdmin);
router.post("/checkin-by-admin/:jobId", checkinByAdmin);
router.post("/after-checkout/:jobId", afterCheckout);
router.get("/new/:jobId", getNewAttendance);
router.post("/checkout/:jobId", checkout);
router.post("/checkin/:jobId", checkin);

module.exports = router;
