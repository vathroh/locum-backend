const { DateTime } = require("luxon");
const Job = require("../../models/Job");
const { setUrgentLogger } = require("../logger/setUrgentLogger");
const { sendingEmail } = require("../sendingEmail");

const setUrgentJob = async () => {
  try {
    const now = DateTime.now().toMillis();
    const jobs24 = await Job.find({
      $and: [
        { work_time_start: { $gte: now } },
        { work_time_start: { $lte: now + 86400000 + 10000 } },
      ],
      assigned_to: [],
    }).populate({ path: "clinic", select: "clinicName" });

    const jobs72 = await Job.find({
      $and: [
        { work_time_start: { $gte: now + 86401000 } },
        { work_time_start: { $lte: now + 259200000 + 10000 } },
      ],
      assigned_to: [],
    }).populate({ path: "clinic", select: "clinicName" });

    jobs24.map(async (item) => {
      await Job.updateOne(
        { _id: item._id },
        {
          $set: { urgent_status: "24" },
        }
      );
      setUrgentLogger.info(
        JSON.stringify({
          _id: item._id,
          clinic_id: item.clinic._id,
          clinicName: item.clinic.clinicName,
        })
      );
    });

    jobs72.map(async (item) => {
      await Job.updateOne(
        { _id: item._id },
        {
          $set: { urgent_status: "72" },
        }
      );
      setUrgentLogger.info(
        JSON.stringify({
          _id: item._id,
          clinic_id: item.clinic._id,
          clinicName: item.clinic.clinicName,
        })
      );
    });

    setUrgentLogger.info(
      `The setUrgentJob has been done at ${DateTime.now().toISO()}`
    );
  } catch (error) {
    setUrgentLogger.error(error.message);
  }
};

module.exports = { setUrgentJob };
