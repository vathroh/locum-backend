const router = require("express").Router();

const {
  upload,
  getCertificate,
  saveCertificate,
  editCertificate,
  deleteCertificate,
} = require("../controllers/certificatesController");

router.get("/:userId", getCertificate);
router.post("/:userId", upload.single("certificate"), saveCertificate);
router.put("/:certificateId", upload.single("certificate"), editCertificate);
router.delete("/:certificateId", deleteCertificate);

module.exports = router;
