const Job = require("../../models/Job");

const updateJobModel = async (req, res) => {
    const jobs = await Job.find();

    const datas = jobs.map(async (data) => {
        let dataitem = {};
        dataitem._id = data._id ?? "";
        dataitem.clinic = data.clinic ?? "";
        dataitem.date = data.date ?? 0;
        dataitem.work_time_start = data.work_time_start ?? 0;
        dataitem.work_time_finish = data.work_time_finish ?? 0;
        dataitem.profession = data.profession ?? "";
        dataitem.price = data.price ?? 0;
        dataitem.prefered_gender = data.prefered_gender ?? "";
        dataitem.scope = data.scope ?? [];
        dataitem.job_description = data.job_description ?? [];
        dataitem.preferences = data.preferences ?? [];
        dataitem.booked_by = data.booked_by ?? [];
        dataitem.assigned_to = data.assigned_to ?? [];
        dataitem.completed = data.completed ?? false;
        dataitem.canceled_by = data.canceled_by ?? [];
        dataitem.image = data.image ?? "";
        dataitem.favorites = data.favorites ?? [];

        await Job.updateOne({ _id: dataitem._id }, { $set: dataitem });
    });

    res.json(await Job.find());
};

module.exports = { updateJobModel };
