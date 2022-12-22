const router = require("express").Router();

const {
    upload,
    getVaccination,
    saveVaccination,
} = require("../controllers/vaccinationController");

router.get("/:userId", getVaccination);

router.post(
    "/",
    upload.fields([
        {
            name: "measles",
            maxCount: 1,
        },
        {
            name: "diphteria",
            maxCount: 1,
        },
    ]),
    saveVaccination
);

module.exports = router;
