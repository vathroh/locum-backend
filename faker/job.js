const { DateTime, Duration } = require("luxon");
const Job = require("../models/Job.js");
const Clinic = require("../models/Clinic.js");
const { faker } = require("@faker-js/faker");
const logger = require("../services/logger/jobSeederLogger");
const { sendingEmail } = require("../services/sendingEmail");
const ObjectId = require("mongoose/lib/types/objectid.js");

const seedJobs = async () => {
  try {
    // return res.json(faker.image.business());
    const clinics = await Clinic.find().select({ _id: 1, initials: 1 });
    const data = [];

    const array = clinics.map(async (e) => {
      const date = DateTime.now().plus({ days: 6 }).toISODate();

      const last = await Job.find({ clinic: ObjectId(req.body.clinic) })
        .sort({ createdAt: -1 })
        .limit(1);

      let count = 0;
      if (last.length > 0) {
        const lastCode = last[0].code;
        count = parseInt(lastCode.split("-")[1]);
      }

      const number = parseInt(count) + 1;
      const string = clinic?.initials + "-000000";

      await data.push({
        code: string.slice(1, 11 - number.toString().length) + number,
        image: faker.helpers.arrayElement([
          "/public/images/1663816528905-istockphoto-138205019-612x612.jpg",
          "/public/images/jobs/1665109795766-doctors-standing.jpg",
          "/public/images/jobs/1666583021884-doctor-advice.jpg",
          "/public/images/1663759550407-Doctors-540x280.jpg",
          "/public/images/jobs/1665108887730-doctors.png",
          "/public/images/jobs/1665110426541-doctor1.jpg",
          "/public/images/jobs/1665983566437-doctor2.jpg",
          "/public/images/jobs/1667017975942-doctor3.jpg",
        ]),
        clinic: e._id,
        date:
          DateTime.fromISO(date, {
            zone: "Asia/Singapore",
          }).toMillis() ?? 0,
        work_time_start:
          DateTime.fromISO(date + "T" + "08:00", {
            zone: "Asia/Singapore",
          }).toMillis() ?? 0,
        work_time_finish:
          DateTime.fromISO(date + "T" + "15:00", {
            zone: "Asia/Singapore",
          }).toMillis() ?? 0,
        price: 200,
        urgent_price_24: 370,
        urgent_price_72: 270,
        profession: faker.helpers.arrayElement([
          "doctor",
          "clinical assistant",
        ]),
        scope: ["Family Medicine"],
        job_description: ["Able to see children 7 years old."],
        break: {
          start:
            DateTime.fromISO(date + "T" + "12:00", {
              zone: "Asia/Singapore",
            }).toMillis() ?? 0,
          finish:
            DateTime.fromISO(date + "T" + "13:00", {
              zone: "Asia/Singapore",
            }).toMillis() ?? 0,
        },
      });
    });

    await Promise.all(array);

    data.map(async (el) => {
      const job = new Job(el);
      const savedJob = await job.save();
    });

    const now = DateTime.now().toISO();
    sendingEmail(
      "romfatur@gmail.com",
      "Seed Job collection",
      `Halo, The job has been seed at ${now}`,
      null
    );

    logger.jobSeederLogger.log(
      "info",
      `successfully seed job collection Data: ${data}`
    );
  } catch (error) {
    logger.jobSeederLogger.log("error", `${error.message}`);
  }
};

module.exports = { seedJobs };
