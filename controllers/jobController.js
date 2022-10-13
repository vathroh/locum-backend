const { DateTime, Duration } = require('luxon');
const { database } = require("firebase-admin");
const Job = require("../models/Job.js");
const moment = require('moment')
const axios = require('axios')
const mongoose = require("mongoose");


const getAllJobs = async (req, res) => {
    try {
        await Job.find()
            .sort({ date: 1 }).lean().populate({ path: 'clinic', select: 'clinicName Address' })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const output = formatData(data)

                res.json(output)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getNewJobs = async (req, res) => {
    try {
        await Job.find().sort({ createdAt: -1 }).lean().populate({ path: 'clinic', select: 'clinicName Address' })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const OpenedStatus = data.filter(function (el) {
                    return el.status == "Booking Opened"
                }).slice(0, 5)

                const output = formatData(OpenedStatus)

                res.json(output)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getUpcomingJobs = async (req, res) => {

    try {
        await Job.find({ work_time_start: { $gte: DateTime.now().toMillis() } })
            .sort({ date: 1 }).lean().populate({ path: 'clinic', select: 'clinicName Address' })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const output = formatData(data)

                res.json(output)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getExploreJobs = async (req, res) => {
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
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1, booked_by: 1, assigned_to: 1, completed: 1, canceled_by: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address'
            })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const OpenedStatus = data.filter(function (el) {
                    return el.status == "Booking Opened"
                })

                const output = formatData(OpenedStatus)

                res.json(output)
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
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1, booked_by: 1, assigned_to: 1, completed: 1, canceled_by: 1 })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const upcoming = data.filter(function (el) {
                    return el.status == "Booking Approved" || el.status == "Booking Pending"
                })

                const output = formatData(upcoming)

                res.json(output)
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
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1, booked_by: 1, assigned_to: 1, completed: 1, canceled_by: 1 })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const upcoming = data.filter(function (el) {
                    return el.status == "Booking Approved" || el.status == "Booking Pending"
                })

                const output = formatData(upcoming)

                res.json(output)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getPastJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find({ date: { $lte: today.toDate() } })
            .sort({ date: -1 }).lean().populate({ path: 'clinic', select: 'clinicName Address' })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const output = formatData(data)

                res.json(output)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getJobById = async (req, res) => {

    try {
        let job = await Job.findById(req.params.id)
            .select({ _id: 1, clinic: 1, price: 1, job_scope: 1, date: 1, work_time_start: 1, work_time_finish: 1, scope: 1, job_description: 1, image: 1, preferences: 1, booked_by: 1, assigned_to: 1, canceled_by: 1, completed: 1, canceled_by: 1 })
            .lean()
            .populate({
                path: 'clinic',
                select: 'clinicName Address description type'
            })
            .exec((err, data) => {

                statusJob(data, req)
                data.work_time_start = DateTime.fromMillis(data.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                data.work_time_finish = DateTime.fromMillis(data.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE)
                data.day = DateTime.fromMillis(data.date).setZone("Asia/Singapore").toFormat('cccc')
                data.date = DateTime.fromMillis(data.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy')

                res.json(data)
            })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getJobByClinicId = async (req, res) => {
    try {
        await Job.find({ "clinic": req.params.id })
            .lean().populate({ path: 'clinic', select: 'clinicName Address' })
            .then((data) => {

                data.map((e, index) => {
                    e.number = ""
                    statusJob(e, req)
                    e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
                })

                const output = formatData(data)

                res.json(output)
            })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const saveJob = async (req, res) => {

    let data = req.body
    data.work_time_start = DateTime.fromISO(req.body.date + "T" + req.body.work_time_start, { zone: "Asia/Singapore" }).toMillis() ?? 0
    data.work_time_finish = DateTime.fromISO(req.body.date + "T" + req.body.work_time_finish, { zone: "Asia/Singapore" }).toMillis() ?? 0
    data.date = DateTime.fromISO(req.body.date, { zone: "Asia/Singapore" }).toMillis() ?? 0;

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



    let filters = {}

    // filters.prefered_gender = req.query.gender
    // filters.price = { $gte: req.query.pricefrom, $lte: req.query.priceto }

    // work_time_start: req.query.timefrom,
    // work_time_finish: req.query.timeto,
    // date: { $gte: req.query.datefrom, $lte: req.query.dateto }


    if (req.query.gender == "both") {
        delete filters.prefered_gender
    }

    await Job.find({ ...filters })
        .populate('clinic')
        .then((jobs) => {

            // jobs.filter((e) => e.clinic.location == req.query.location)
            a = jobs.filter((e) => e.clinic.clinicName.search(req.query.clinic) >= 0)
            // for(let i=0; i<jobs.length; i++) {
            //     for(let key in jobs[i]) {
            //       if(jobs[i][key].indexOf(toSearch)!=-1) {
            //         // if(!itemExists(results, objects[i])) results.push(objects[i]);
            //       }
            //     }
            //   }
            // jobs.filter((e) => e.match(/gem/))
            res.json(a)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        })
}

//Searching Jobs
const searchJob = async (req, res) => {
    await Job.find()
        .populate('clinic')
        .then((jobs) => {
            let data = []
            jobs.filter((e) => {
                if (e.clinic.location.toLowerCase() == req.query.keyword.toLowerCase()) {
                    data.push(e)
                }
            })
            jobs.filter((e) => {
                let clinic = e.clinic.clinicName.toLowerCase()
                if (clinic.search(req.query.keyword.toLowerCase()) > -1) {
                    data.push(e)
                }
            })

            const unique = [...new Set(data.map(item => item))];

            unique.map((e, index) => {
                e.number = ""
                statusJob(e, req)
                e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject()
            })

            const output = formatData(unique)

            res.json(output)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        })
}


const youMightLike = async (req, res) => {

    const today = moment().startOf('day')

    const user = await axios({
        method: 'GET',
        url: process.env.BASE_URL + "/user/" + req.body.user_id
    })
        .then((result) => {
            console.log(result)
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            res.json(err)
        })

    const jobs = await Job.find(
        {
            date: {
                $lte: today.toDate()
            },
            prefered_gender: "both"
        }
    )

    const ranks = jobs.map(async (d) => {
        let score = 0
        const score1 = score

        if (genderPreference) {
            if (d.gender == genderPreference) {
                score += 20
            }
        }

        const score2 = score

        //Attendance
        const now = new Date();
        const aDayAgo = now.getTime() - 172800000;

        const aDayAttendance = await Attendance.find({
            "doctor_id": d._id, "clinic_id": clinic._id, date: { $gt: aDayAgo }
        });

        if (aDayAttendance.length > 0) {
            score += 15
        }

        const score3 = score

        return {
            doctorId: d._id,
            doctorName: d.doctorName,
            score: score
        }
    })

    promisedRanks = await Promise.all(ranks)

    res.json(promisedRanks.sort((a, b) => {
        return b.score - a.score
    }))
}

const statusJob = (e, req) => {
    if (e.completed == true) {
        e.status = "Booking Completed"
    } else if (e.canceled_by?.length > 0) {
        e.status = "Booking Canceled"
    } else if (e.booked_by.includes(req.user._id) && !e.assigned_to.includes(req.user._id)) {
        e.status = "Booking Pending"
    } else if (e.assigned_to.includes(req.user._id)) {
        e.status = "Booking Approved"
    } else {
        e.status = "Booking Opened"
    }
}

const formatData = (data) => {
    return data.map((e) => {
        return {
            _id: e._id,
            clinic: e.clinic,
            date: e.date,
            work_time_start: e.work_time_start,
            work_time_finish: e.work_time_finish,
            price: e.price,
            scope: e.scope,
            job_description: e.job_description,
            booked_by: e.booked_by,
            assigned_to: e.assigned_to,
            completed: e.completed,
            canceled_by: e.canceled_by,
            status: e.status,
            image: process.env.BASE_URL + e.image,
            number: e.number,
            duration: Duration.fromMillis(e.work_time_finish - e.work_time_start).shiftTo("hours").toObject(),
            priceDuration: e.duration.hours * e.price,
            time_start_format: DateTime.fromMillis(e.work_time_start).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE),
            time_finish_format: DateTime.fromMillis(e.work_time_finish).setZone("Asia/Singapore").toLocaleString(DateTime.TIME_SIMPLE),
            date_format: DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('dd LLLL yyyy'),
            day: DateTime.fromMillis(e.date).setZone("Asia/Singapore").toFormat('cccc')
        }
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
    youMightLike,
    filteredJob,
    searchJob,
    statusJob,
    formatData,
    getExploreJobs
}