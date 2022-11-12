const express = require("express");
const router = express.Router();
const Job = require("../models/Job.js");
const {
    authFirebaseMiddleware,
    authJwtMiddleware,
    verifyIdToken,
} = require("../middleware/authMiddleware");
const { DateTime, Duration } = require("luxon");

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

router.post("/jobs", upload.single("image"), async (req, res) => {
    let data = req.body;
    data.image = "/" + req.file?.destination + "/" + req.file?.filename;
    // return res.json(data)
    console.log(req.file?.destination);
    data.work_time_start = DateTime.fromISO(
        req.body.date + "T" + req.body.work_time_start,
        { zone: "Asia/Singapore" }
    ).toMillis();
    data.work_time_finish = DateTime.fromISO(
        req.body.date + "T" + req.body.work_time_finish,
        { zone: "Asia/Singapore" }
    ).toMillis();
    data.date = DateTime.fromISO(req.body.date, {
        zone: "Asia/Singapore",
    }).toMillis();

    const job = new Job(data);

    try {
        const savedJob = await job.save();
        res.status(200).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/verify", verifyIdToken);

router.get("/", authJwtMiddleware, (req, res) => {
    res.send(
        '<center><h1 style="margin-top:200px;">Hello from LOCUM App.</h1></center>'
    );
});

module.exports = router;
