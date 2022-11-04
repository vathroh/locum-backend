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
    setFavorite,
    getPastJobs,
    filteredJob,
    youMightLike,
    getCurrentJob,
    getExploreJobs,
    getUpcomingJobs,
    favoritesByUser,
    getJobByClinicId,
    getUpcomingDoctorJobs,
    getCalendarJobByClinicId,
    getUpcomingClinicalAssistantJobs,
} = require("../controllers/jobController.js");
const { updateJobModel } = require("../services/updateModels/job.js");

router.get("/update-model", updateJobModel);

router.get("/calendar/:clinicId/:year/:month", getCalendarJobByClinicId);
router.get("/clinical-assistant", getUpcomingClinicalAssistantJobs);
router.get("/favorites-by-user/:userId", favoritesByUser);
router.post("/set-favorite/:jobId", setFavorite);
router.get("/get-current-job", getCurrentJob);
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
