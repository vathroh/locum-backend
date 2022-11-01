const { DateTime, Duration } = require("luxon");
const Job = require("../models/Job.js");
const Clinic = require("../models/Clinic.js");
const { faker } = require("@faker-js/faker");
const logger = require("../services/logger/jobSeederLogger");
const { sendingEmail } = require("../services/sendingEmail");

const seedJobs = async () => {
    try {
        // return res.json(faker.image.business());
        const clinics = await Clinic.find().select({ _id: 1 });
        const data = [];
        clinics.map((e) => {
            const date = DateTime.now().plus({ days: 6 }).toISODate();

            data.push({
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
                profession: faker.helpers.arrayElement([
                    "doctor",
                    "clinical assistant",
                ]),
                prefered_gender: faker.helpers.arrayElement(["male", "female"]),
                scope: ["Family Medicine"],
                job_description: ["Able to see children 7 years old."],
            });
        });

        data.map(async (el) => {
            const job = new Job(el);
            const savedJob = await job.save();
        });

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
