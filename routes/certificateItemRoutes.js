const express = require("express");
const router = express.Router();

const {
  getCertificateitems,
  getCertificateitemById,
  saveCertificateitem,
  updateCertificateitem,
  deleteCertificateitem,
} = require("../controllers/certificateItemController.js");

router.get("/", getCertificateitems);
router.get("/:id", getCertificateitemById);
router.post("/", saveCertificateitem);
router.patch("/:id", updateCertificateitem);
router.delete("/:id", deleteCertificateitem);

module.exports = router;
