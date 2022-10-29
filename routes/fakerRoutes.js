const router = require("express").Router();
const { seedJobs } = require("../faker/job");

router.get("/all-job", seedJobs);

module.exports = router;
