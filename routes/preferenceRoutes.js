const {
    getPreferences,
    savePreference,
    deletePreference,
    updatePreference,
} = require("../controllers/preferenceController");

const router = require("express").Router();

router.get("/", getPreferences);
router.post("/", savePreference);
router.put("/:id", updatePreference);
router.delete("/:id", deletePreference);

module.exports = router;
