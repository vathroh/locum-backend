const express = require("express");
const router = express.Router();

const {
  createBooking,
  deleteBooking,
  pastBookingByClinic,
  sendInterviewRequest,
  upcomingBookingsByUserId,
  countUpcomingAssignmentsByUserId,
  upcomingUnassignmentByUserId,
  upcomingAssignmentsByUserId,
  countCompletedJobsByUser,
  completedJobsByUser,
  canceledJobsByUser,
  removeRejected,
  rejectBooking,
  AssignTo,
} = require("../controllers/bookingController");

router.put("/create/:id", createBooking);
router.put("/delete/:id", deleteBooking);
// router.get("/past-booking", pastBookingByClinic);
router.get("/canceled/:userId", canceledJobsByUser);
router.post("/send-interview-request", sendInterviewRequest);
router.get("/upcoming-by-user/:userId", upcomingBookingsByUserId);
router.get("/count/completed-by-user/:userId", countCompletedJobsByUser);
router.get("/count/upcoming-by-user/:userId", countUpcomingAssignmentsByUserId);
router.get("/unassignment/by-user/:userId", upcomingUnassignmentByUserId);
router.get("/assignment/by-user/:userId", upcomingAssignmentsByUserId);
router.get("/assignment/completed/:userId", completedJobsByUser);
router.put("/assignment/remove-rejected/:jobId", removeRejected);
router.put("/assignment/reject/:jobId", rejectBooking);
router.put("/assignment/create/:id", AssignTo);

module.exports = router;
