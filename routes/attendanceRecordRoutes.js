const express = require("express");
const router = express.Router();

const {
    getAttendances,
    getAttendanceById,
    saveAttendance,
    updateAttendance,
    deleteAttendance,
    getNewAttendance,
} = require("../controllers/attendanceRecordController.js");

router.get("/new/:jobId", getNewAttendance);
router.get("/", getAttendances);
router.get("/:id", getAttendanceById);
router.post("/", saveAttendance);
router.patch("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;
