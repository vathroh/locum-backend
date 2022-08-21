const express = require("express");
const router = express.Router();

const {
    getAttendances,
    getAttendanceById,
    saveAttendance,
    updateAttendance,
    deleteAttendance
} = require("../controllers/attendanceRecordController.js");

router.get('/', getAttendances);
router.get('/:id', getAttendanceById);
router.post('/', saveAttendance);
router.patch('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;