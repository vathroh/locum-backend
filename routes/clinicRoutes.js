const express = require("express");
const router = express.Router();

const {
  upload,
  getAdmin,
  getOtherOutlet,
  getClinics,
  getClinicById,
  saveClinic,
  updateClinic,
  deleteClinic,
  getClinicByUserId,
} = require("../controllers/clinicController.js");

const { updateClinicModel } = require("../services/updateModels/clinic");

router.get("/other-outlet/:clinicId", getOtherOutlet);
router.get("/update-model", updateClinicModel);
router.get("/get-by-user", getClinicByUserId);
router.get("/admin", getAdmin);
router.get("/", getClinics);
router.get("/:id", getClinicById);
router.delete("/:id", deleteClinic);
router.post("/", upload.single("logo"), saveClinic);
router.put("/:id", upload.single("logo"), updateClinic);

module.exports = router;
