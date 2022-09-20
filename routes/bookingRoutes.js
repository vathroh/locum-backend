const express = require("express");
const router = express.Router();

const {
    createBooking,
    deleteBooking,
    upcomingBookingsByUserId,
    countUpcomingAssignmentsByUserId,
    upcomingAssignmentsByUserId,
    countCompletedJobsByUser,
    completedJobsByUser,
    AssignTo
} = require("../controllers/bookingController");


router.put('/create/:id', createBooking);
router.put('/delete/:id', deleteBooking);
router.get('/upcoming-by-user/:userId', upcomingBookingsByUserId);
router.get('/count/completed-by-user/:userId', countCompletedJobsByUser);
router.get('/count/upcoming-by-user/:userId', countUpcomingAssignmentsByUserId);
router.get('/assignment/by-user/:userId', upcomingAssignmentsByUserId);
router.get('/assignment/completed/:userId', completedJobsByUser);
router.put('/assignment/create/:id', AssignTo);

module.exports = router;