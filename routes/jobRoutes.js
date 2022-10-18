const express = require("express");
const router = express.Router();

const {
    saveJob,
    updateJob,
    deleteJob,
    searchJob,
    getNewJobs,
    getJobById,
    getAllJobs,
    getPastJobs,
    filteredJob,
    youMightLike,
    getExploreJobs,
    getUpcomingJobs,
    getJobByClinicId,
    getUpcomingDoctorJobs,
    getCalendarJobByClinicId,
    getUpcomingClinicalAssistantJobs,
} = require("../controllers/jobController.js");

router.get("/calendar/:clinicId/:year/:month", getCalendarJobByClinicId);
router.get("/clinical-assistant", getUpcomingClinicalAssistantJobs);
router.get("/doctor", getUpcomingDoctorJobs);
router.get("/you-might-like", youMightLike);
router.get("/clinic/:id", getJobByClinicId);
router.get("/upcoming", getUpcomingJobs);
router.get("/explore", getExploreJobs);
router.get("/filter", filteredJob);
router.get("/past", getPastJobs);
router.get("/search", searchJob);
router.get("/new", getNewJobs);
router.get("/:id", getJobById);
router.get("/", getAllJobs);
// router.post('/', saveJob);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
