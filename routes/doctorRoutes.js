const express = require("express");
const router = express.Router();

const {
    getDoctors,
    getDoctorById,
    saveDoctor,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController.js");


router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', saveDoctor);
router.patch('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);


module.exports = router;