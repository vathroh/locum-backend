const express = require("express");
const router = express.Router();

const {
    getAllJobs, getUpcomingJobs, getPastJobs, getJobById, saveJob, updateJob, deleteJob
} = require("../controllers/jobController.js");

router.get('/', getAllJobs);
router.get('/upcoming', getUpcomingJobs);
router.get('/past', getPastJobs);
router.get('/:id', getJobById);
router.post('/', saveJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;