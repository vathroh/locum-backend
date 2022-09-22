const Job = require("../models/Job.js");
const moment = require('moment')
const { DateTime, Duration } = require('luxon')

const getAllJobs = async (req, res) => {
    try {
        await Job.find()
            .sort({ date: 1 })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getNewJobs = async (req, res) => {
    try {
        await Job.find()
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getUpcomingJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        await Job.find(
            {
                work_time_start: {
                    $gte: DateTime.now().toMillis()
                }
            }
        )
            .sort({ date: 1 })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getUpcomingDoctorJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find(
            {
                date: {
                    $gte: today.toDate()
                },
                profession: "doctor"
            }
        )
            .sort({ date: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getUpcomingClinicalAssistantJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find(
            {
                date: {
                    $gte: today.toDate()
                },
                profession: "clinical assistant"
            }
        )
            .sort({ date: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getPastJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find(
            {
                date: {
                    $lte: today.toDate()
                }
            }
        )
            .sort({ date: -1 })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getJobById = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id)
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {

                data.number = ""
                data.duration = Duration.fromMillis(data.work_time_finish - data.work_time_start).shiftTo("hours").toObject()
                data.priceDuration = data.duration.hours * data.price
                data.time_start_format = DateTime.fromMillis(data.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                data.time_finish_format = DateTime.fromMillis(data.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                data.date_format = DateTime.fromMillis(data.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                data.day = DateTime.fromMillis(data.date).setZone("Asia/Singapore").toFormat('cccc')
                res.json(data)
            })
        res.json(job);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getJobByClinicId = async (req, res) => {
    try {
        await Job.find({ "clinic": req.params.id })
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {
                data.map((e, index) => {
                    if (index === 0 || index === 1) {
                        e.number = index + 1
                    } else {
                        e.number = ""
                    }
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                    e.priceDuration = e.duration.hours * e.price
                    e.time_start_format = DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.time_finish_format = DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                    e.date_format = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')
                    e.day = DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
                })
                res.json(data)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const saveJob = async (req, res) => {

    let data = req.body
    data.work_time_start = DateTime.fromISO(req.body.date + "T" + req.body.work_time_start, { zone: "Asia/Singapore" }).toMillis()
    data.work_time_finish = DateTime.fromISO(req.body.date + "T" + req.body.work_time_finish, { zone: "Asia/Singapore" }).toMillis()
    data.date = DateTime.fromISO(req.body.date, { zone: "Asia/Singapore" }).toMillis();

    const job = new Job(data);

    try {
        const savedJob = await job.save();
        res.status(200).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateJob = async (req, res) => {
    const jobId = await Job.findById(req.params.id);
    if (!jobId) return res.status(404).json({ message: "The job is not found." });
    try {
        const updatedJob = await Job.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


const deleteJob = async (req, res) => {
    const jobId = await Job.findById(req.params.id);
    if (!jobId) return res.status(404).json({ message: "The job is not found." });
    try {
        const deletedJob = await Job.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(deletedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


//Searching Jobs
const filteredJob = async (req, res) => {

    let filters = {
        gender: req.query.prefered_gender,
        location: req.query.location,
        work_time_start: req.query.timefrom,
        work_time_finish: req.query.timeto,
        price: { $gte: req.query.pricefrom, $lte: req.query.priceto },
        date: { $gte: req.query.datefrom, $lte: req.query.dateto }
    }

    await Job.find({ ...filters })
        .populate('clinic')
        .then((jobs) => {
            const a = jobs.filter((e) => e.clinic.location == req.query.location)
            res.json(a)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        })
}

module.exports = {
    getAllJobs,
    getUpcomingJobs,
    getPastJobs,
    getJobById,
    getJobByClinicId,
    saveJob,
    updateJob,
    deleteJob,
    getNewJobs,
    getUpcomingDoctorJobs,
    getUpcomingClinicalAssistantJobs,
    filteredJob
}