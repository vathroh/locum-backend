const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const mimeTypes = ["image/jpeg", "image/png", "image/gif"];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/jobs");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

const {
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
  getCurrentSlot,
  getUpcomingJobs,
  favoritesByUser,
  getJobByClinicId,
  postDirectListing,
  postManualListing,
  upcomingByClinicId,
  postAutomatedListing,
  EmptySlotsByClinicId,
  filledSlotsByClinicId,
  getUpcomingDoctorJobs,
  getCalendarJobByClinicId,
  needApprovedByClinicId,
  getUpcomingClinicalAssistantJobs,
} = require("../controllers/jobController.js");
const { updateJobModel } = require("../services/updateModels/job.js");

router.get("/update-model", updateJobModel);

router.post(
  "/post-automated-listing",
  upload.single("image"),
  postAutomatedListing
);

router.get("/current-slot", getCurrentSlot);
router.post("/post-manual-listing", upload.single("image"), postManualListing);
router.post("/post-direct-listing", upload.single("image"), postDirectListing);
router.get("/calendar/:clinicId/:year/:month", getCalendarJobByClinicId);
router.get("/clinical-assistant", getUpcomingClinicalAssistantJobs);
router.get("/filled-slot-by-clinic", filledSlotsByClinicId);
router.get("/empty-slot-by-clinic", EmptySlotsByClinicId);
router.get("/favorites-by-user/:userId", favoritesByUser);
router.get("/need-approval", needApprovedByClinicId);
router.get("/upcoming/clinic", upcomingByClinicId);
router.post("/set-favorite/:jobId", setFavorite);
router.get("/get-current-job", getCurrentJob);
router.get("/doctor", getUpcomingDoctorJobs);
router.get("/you-might-like", youMightLike);
router.get("/clinic", getJobByClinicId);
router.get("/upcoming", getUpcomingJobs);
router.get("/explore", getExploreJobs);
router.get("/filter", filteredJob);
router.get("/bookedby", bookedBy);
router.get("/past", getPastJobs);
router.get("/search", searchJob);
router.delete("/:id", deleteJob);
router.get("/new", getNewJobs);
router.get("/:id", getJobById);
router.get("/", getAllJobs);

router.put("/edit/:id", upload.single("image"), updateJob);

module.exports = router;
