const express = require("express");
const router = express.Router();

const {
    createBooking,
    deleteBooking,
    upcomingBookingsByUserId,
    upcomingAssignmentsByUserId,
    completedJobsByUser,
    AssignTo
} = require("../controllers/bookingController");


router.put('/create/:id', createBooking);
router.put('/delete/:id', deleteBooking);
router.get('/upcoming-by-user/:userId', upcomingBookingsByUserId);
router.get('/assignment/by-user/:userId', upcomingAssignmentsByUserId);
router.get('/assignment/completed/:userId', completedJobsByUser);
router.put('/assignment/create/:userId', AssignTo);

module.exports = router;