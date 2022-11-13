const { DateTime } = require("luxon");
const Job = require("../../models/Job");
const { setUrgentLogger } = require("../logger/setUrgentLogger");
const { sendingEmail } = require("../sendingEmail");

const setUrgentJob = async () => {
    try {
        const now = DateTime.now().toMillis();
        const jobs = await Job.find({
            $and: [
                { work_time_start: { $gte: now } },
                { work_time_start: { $lte: now + 172800000 } },
            ],
        }).populate({ path: "clinic", select: "clinicName" });

        jobs.map(async (item) => {
            if (item.isUrgent == false) {
                await Job.updateOne(
                    { _id: item._id },
                    { $set: { isUrgent: true, price: item.price + 20 } }
                );
                setUrgentLogger.info(
                    JSON.stringify({
                        _id: item._id,
                        clinic_id: item.clinic._id,
                        clinicName: item.clinic.clinicName,
                        oldPrice: item.price,
                        newPrice: item.price + 20,
                    })
                );
            }
        });
        setUrgentLogger.info(
            `The setUrgentJob has been done at ${DateTime.now().toISO()}`
        );
    } catch (error) {
        setUrgentLogger.error(error.message);
    }
};

module.exports = { setUrgentJob };
