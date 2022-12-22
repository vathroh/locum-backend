const router = require("express").Router();

const {
  upload,
  getCertificate,
  saveCertificate,
  editCertificate,
  deleteCertificate,
} = require("../controllers/certificatesController");

router.get("/:userId", getCertificate);
router.post("/:userId", upload.single("file"), saveCertificate);
router.put("/:certificateId", upload.single("file"), editCertificate);
router.delete("/:certificateId", deleteCertificate);

module.exports = router;
