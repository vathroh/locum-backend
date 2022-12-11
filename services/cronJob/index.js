const cronJob = require("node-cron");
const { DateTime } = require("luxon");
const { seedJobs } = require("../../faker/job");
const { setUrgentJob } = require("./setUrgentJob");

cronJob.schedule("0 * * * * *", () => {
  const now = DateTime.now().setZone("Asia/Singapore").toFormat("HH:mm:ss");
  // console.log(`job seed at ${now} Singapore Timezone`);
  seedJobs();
});

cronJob.schedule("0 0 * * * *", () => {
  setUrgentJob();
  console.log(
    `jobs set to urgent at ${DateTime.now()
      .setZone("Asia/Singapore")
      .toFormat("HH:mm:ss")} Singapore Timezone`
  );
});
