const router = require("express").Router();

const {
  getOtherCertificate,
  getOtherCertificateByUser,
  saveOtherCertificate,
  upload,
} = require("../controllers/otherCertificateController");

router.get("/", getOtherCertificate);
router.get("/user/:userId", getOtherCertificateByUser);
router.post("/", upload.single("file"), saveOtherCertificate);

module.exports = router;
