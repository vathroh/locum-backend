const express = require("express");
const router = express.Router();

const {
    createBooking,
    deleteBooking,
    upcomingBookingsByUserId,
    AssignTo
} = require("../controllers/bookingController");


router.put('/create/:id', createBooking);
router.put('/delete/:id', deleteBooking);
router.get('/upcoming-by-user/:userId', upcomingBookingsByUserId);
router.get('/assignment/create/:id', AssignTo);

module.exports = router;