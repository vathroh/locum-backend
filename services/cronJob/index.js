const cronJob = require("node-cron");
const { DateTime } = require("luxon");
const { seedJobs } = require("../../faker/job");
const { setUrgentJob } = require("./setUrgentJob");

cronJob.schedule("0 0 0 * * *", () => {
  const now = DateTime.now().setZone("Asia/Jakarta").toFormat("HH:mm:ss");
  console.log(`job seed at ${now}`);
  seedJobs();
});

cronJob.schedule("0 * * * * *", () => {
  const now = DateTime.now().setZone("Asia/Jakarta").toFormat("HH:mm:ss");
  console.log(`${now}`);
});

cronJob.schedule("0 0 19 * * *", () => {
  setUrgentJob();
});
