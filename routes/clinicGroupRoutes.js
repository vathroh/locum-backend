const router = require("express").Router();
const {
    upload,
    documents,
    mailingAddress,
    getClinicGroups,
    saveClinicGroup,
    getClinicsByGroup,
} = require("../controllers/clinicGroupController");

router.get("/clinics/:groupId", getClinicsByGroup);
router.get("/", getClinicGroups);
router.post("/create", saveClinicGroup);
router.post("/input-mailing-address/:groupId", mailingAddress);
router.post(
    "/upload-documents/:groupId",
    upload.fields([
        {
            name: "moh_licence",
            maxCount: 1,
        },
        {
            name: "business_acra",
            maxCount: 1,
        },
    ]),
    documents
);

module.exports = router;
