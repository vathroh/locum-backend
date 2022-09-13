const express = require("express");
const router = express.Router();

const {
    getAllJobs,
    getUpcomingJobs,
    getPastJobs, getJobById, getJobByClinicId, saveJob, updateJob, deleteJob,
    filteredJob
} = require("../controllers/jobController.js");

router.get('/clinic/:id', getJobByClinicId);
router.get('/upcoming', getUpcomingJobs);
router.get('/filter', filteredJob);
router.get('/past', getPastJobs);
router.get('/:id', getJobById);
router.get('/', getAllJobs);
router.post('/', saveJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;