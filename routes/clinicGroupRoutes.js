const router = require("express").Router();
const {
    upload,
    documents,
    mailingAddress,
    getClinicGroups,
    saveClinicGroup,
    getClinicsByGroup,
    getClinicGroupByUserId,
} = require("../controllers/clinicGroupController");

router.post("/input-mailing-address/:groupId", mailingAddress);
router.get("/get-company-by-user", getClinicGroupByUserId);
router.get("/clinics/:groupId", getClinicsByGroup);
router.post("/create", saveClinicGroup);
router.get("/", getClinicGroups);

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
