const cronJob = require("node-cron");
const { DateTime } = require("luxon");
const { setUrgentJob } = require("./setUrgentJob");

cronJob.schedule("0 0 * * * *", () => {
  setUrgentJob();
  console.log(
    `jobs set to urgent at ${DateTime.now()
      .setZone("Asia/Singapore")
      .toFormat("HH:mm:ss")} Singapore Timezone`
  );
});
