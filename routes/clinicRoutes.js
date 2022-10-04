const express = require("express");
const router = express.Router();

const {
    getOtherOutlet,
    getClinics,
    getClinicById,
    saveClinic,
    updateClinic,
    deleteClinic
} = require("../controllers/clinicController.js");

const { updateClinicModel } = require('../services/updateModels/clinic')

router.get('/other-outlet/:clinicId', getOtherOutlet)
router.get('/update-model', updateClinicModel)

router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', saveClinic);
router.patch('/:id', updateClinic);
router.delete('/:id', deleteClinic);


module.exports = router;