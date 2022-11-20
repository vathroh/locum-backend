const router = require("express").Router();

const {
    upload,
    getCertificate,
    saveCertificate,
} = require("../controllers/certificatesController");

router.get("/:userId", getCertificate);

router.post("/:userId", upload.single("certificate"), saveCertificate);

module.exports = router;
