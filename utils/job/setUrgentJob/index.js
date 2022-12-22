const { DateTime } = require("luxon");

const setUrgentJobStatus = async (job) => {
  const now = DateTime.now().toMillis();

  if (job.work_time_start) {
    if (job.work_time_start > now && job.work_time_start < now + 86400000) {
      job.urgent_status = "24";
    } else if (
      job.work_time_start > now + 86400000 &&
      job.work_time_start < now + 259200000
    ) {
      job.urgent_status = "72";
    } else {
      job.urgent_status = "normal";
    }
  }

  return job;
};

module.exports = { setUrgentJobStatus };
