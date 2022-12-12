const express = require("express");
const router = express.Router();

const {
  getDevices,
  getDeviceById,
  saveDevice,
  updateDevice,
  deleteDevice,
} = require("../controllers/deviceController.js");

router.get("/", getDevices);
router.get("/:id", getDeviceById);
router.post("/", saveDevice);
router.patch("/:id", updateDevice);
router.delete("/:id", deleteDevice);

module.exports = router;
