const express = require("express");
const router = express.Router();
const Job = require("../models/Job.js");
const { DateTime, Duration } = require("luxon");
const { authJwtMiddleware } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const mimeTypes = ["image/jpeg", "image/png", "image/gif"];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/jobs");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

router.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

router.get("/", (req, res) => {
  res.send(
    '<center><h1 style="margin-top:200px;">Hello from WorkWiz App</h1></center>'
  );
});

module.exports = router;
