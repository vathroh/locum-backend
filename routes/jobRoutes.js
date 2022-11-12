const express = require("express");
const router = express.Router();

const {
    saveJob,
    bookedBy,
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
    upcomingByClinicId,
    getUpcomingDoctorJobs,
    getCalendarJobByClinicId,
    needApprovedByClinicId,
    getUpcomingClinicalAssistantJobs,
} = require("../controllers/jobController.js");
const { updateJobModel } = require("../services/updateModels/job.js");

router.get("/update-model", updateJobModel);

router.get("/calendar/:clinicId/:year/:month", getCalendarJobByClinicId);
router.get("/clinical-assistant", getUpcomingClinicalAssistantJobs);
router.get("/favorites-by-user/:userId", favoritesByUser);
router.get("/upcoming/clinic", upcomingByClinicId);
router.post("/set-favorite/:jobId", setFavorite);
router.get("/get-current-job", getCurrentJob);
router.get("/doctor", getUpcomingDoctorJobs);
router.get("/you-might-like", youMightLike);
router.get("/clinic", getJobByClinicId);
router.get("/upcoming", getUpcomingJobs);
router.get("/need-approval", needApprovedByClinicId);
router.get("/explore", getExploreJobs);
router.get("/filter", filteredJob);
router.get("/bookedby", bookedBy);
router.get("/past", getPastJobs);
router.get("/search", searchJob);
router.get("/new", getNewJobs);
router.get("/:id", getJobById);
router.get("/", getAllJobs);
// router.post('/', saveJob);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
