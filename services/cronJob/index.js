const cronJob = require("node-cron");
const { DateTime } = require("luxon");
const { seedJobs } = require("../../faker/job");
const { sendingEmail } = require("../sendingEmail");

cronJob.schedule("0 0 0 * * *", () => {
    const now = DateTime.now().setZone("Asia/Jakarta").toFormat("HH:mm:ss");
    seedJobs();
});

cronJob.schedule("* * * * * *", () => {
    const now = DateTime.now().setZone("Asia/Jakarta").toFormat("HH:mm:ss");

    // console.log(now);
});
