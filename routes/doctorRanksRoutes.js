const express = require("express");
const router = express.Router();

const {
    getDoctorRanks, getDoctorRanksByClinicId
} = require("../controllers/doctorRanksController");

router.get('/', getDoctorRanks);
router.get('/:id', getDoctorRanksByClinicId);

module.exports = router;