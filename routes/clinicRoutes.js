const express = require("express");
const router = express.Router();

const {
    getClinics,
    getClinicById,
    saveClinic,
    updateClinic,
    deleteClinic
} = require("../controllers/clinicController.js");

router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', saveClinic);
router.patch('/:id', updateClinic);
router.delete('/:id', deleteClinic);

module.exports = router;