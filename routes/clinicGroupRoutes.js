const router = require('express').Router()
const {
    saveClinicGroup,
    getClinicGroups
} = require('../controllers/clinicGroupController')


router.get('/', getClinicGroups);
router.post('/create', saveClinicGroup);

module.exports = router