const { DateTime, Duration } = require("luxon");
const { database } = require("firebase-admin");
const Job = require("../models/Job.js");
const moment = require("moment");
const axios = require("axios");
const mongoose = require("mongoose");
const { jobLogger } = require("../services/logger/jobLogger");
const { errorMonitor } = require("nodemailer/lib/xoauth2/index.js");
const User = require("../models/User");
const personal = require("../models/personalInormation");
const personalInormation = require("../models/personalInormation");
const Attendance = require("../models/AttendanceRecord");
const Clinic = require("../models/Clinic");

const getAllJobs = async (req, res) => {
    try {
        await Job.find()
            .sort({ date: 1 })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getNewJobs = async (req, res) => {
    try {
        await Job.find()
            .sort({ createdAt: -1 })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const OpenedStatus = data
                    .filter(function (el) {
                        return el.status == "Booking Opened";
                    })
                    .slice(0, 5);

                const output = formatData(OpenedStatus);

                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getUpcomingJobs = async (req, res) => {
    try {
        await Job.find({ work_time_start: { $gte: DateTime.now().toMillis() } })
            .sort({ date: 1 })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getExploreJobs = async (req, res) => {
    const today = moment().startOf("day");

    try {
        await Job.find({
            work_time_start: {
                $gte: DateTime.now().toMillis(),
            },
        })
            .sort({ date: 1 })
            .select({
                _id: 1,
                clinic: 1,
                price: 1,
                job_scope: 1,
                date: 1,
                work_time_start: 1,
                work_time_finish: 1,
                scope: 1,
                job_description: 1,
                image: 1,
                booked_by: 1,
                assigned_to: 1,
                completed: 1,
                canceled_by: 1,
            })
            .lean()
            .populate({
                path: "clinic",
                select: "clinicName Address",
            })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const OpenedStatus = data.filter(function (el) {
                    return el.status == "Booking Opened";
                });

                const output = formatData(OpenedStatus);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const getUpcomingDoctorJobs = async (req, res) => {
    const today = moment().startOf("day");

    try {
        const jobs = await Job.find({
            date: {
                $gte: today.toDate(),
            },
            profession: "doctor",
        })
            .sort({ date: 1 })
            .lean()
            .populate({
                path: "clinic",
                select: "clinicName Address",
            })
            .select({
                _id: 1,
                clinic: 1,
                price: 1,
                job_scope: 1,
                date: 1,
                work_time_start: 1,
                work_time_finish: 1,
                scope: 1,
                job_description: 1,
                image: 1,
                booked_by: 1,
                assigned_to: 1,
                completed: 1,
                canceled_by: 1,
            })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const upcoming = data.filter(function (el) {
                    return (
                        el.status == "Booking Approved" ||
                        el.status == "Booking Pending"
                    );
                });

                const output = formatData(upcoming);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const getUpcomingClinicalAssistantJobs = async (req, res) => {
    const today = moment().startOf("day");

    try {
        const jobs = await Job.find({
            date: {
                $gte: today.toDate(),
            },
            profession: "clinical assistant",
        })
            .sort({ date: 1 })
            .lean()
            .populate({
                path: "clinic",
                select: "clinicName Address",
            })
            .select({
                _id: 1,
                clinic: 1,
                price: 1,
                job_scope: 1,
                date: 1,
                work_time_start: 1,
                work_time_finish: 1,
                scope: 1,
                job_description: 1,
                image: 1,
                booked_by: 1,
                assigned_to: 1,
                completed: 1,
                canceled_by: 1,
            })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const upcoming = data.filter(function (el) {
                    return (
                        el.status == "Booking Approved" ||
                        el.status == "Booking Pending"
                    );
                });

                const output = formatData(upcoming);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const getPastJobs = async (req, res) => {
    const today = moment().startOf("day");

    try {
        const jobs = await Job.find({ date: { $lte: today.toDate() } })
            .sort({ date: -1 })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);

                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id)
            .select({
                _id: 1,
                clinic: 1,
                price: 1,
                job_scope: 1,
                date: 1,
                work_time_start: 1,
                work_time_finish: 1,
                scope: 1,
                job_description: 1,
                image: 1,
                preferences: 1,
                booked_by: 1,
                assigned_to: 1,
                canceled_by: 1,
                completed: 1,
                canceled_by: 1,
            })
            .lean()
            .populate({
                path: "clinic",
                select: "clinicName Address description type",
            })
            .exec((err, data) => {
                statusJob(data, req);
                data.image = process.env.BASE_URL + data.image;
                data.work_time_start = DateTime.fromMillis(data.work_time_start)
                    .setZone("Asia/Singapore")
                    .toLocaleString(DateTime.TIME_SIMPLE);
                data.work_time_finish = DateTime.fromMillis(
                    data.work_time_finish
                )
                    .setZone("Asia/Singapore")
                    .toLocaleString(DateTime.TIME_SIMPLE);
                data.day = DateTime.fromMillis(data.date)
                    .setZone("Asia/Singapore")
                    .toFormat("cccc");
                data.date = DateTime.fromMillis(data.date)
                    .setZone("Asia/Singapore")
                    .toFormat("dd LLLL yyyy");

                jobLogger.info(req.originalUrl);
                res.json(data);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getJobByClinicId = async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * page;

    try {
        const totalRows = await Job.find({ clinic: req.query.id }).count();
        const totalPage = Math.ceil(totalRows / limit);
        await Job.find({ clinic: req.query.id })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .sort({ work_time_start: -1 })
            .skip(offset)
            .limit(limit)
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);
                res.json({
                    page: page + 1,
                    limit: limit,
                    totalRows: totalRows,
                    totalPage: totalPage,
                    data: output,
                });
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const upcomingByClinicId = async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * page;

    try {
        const now = DateTime.now().toMillis();

        const totalRows = await Job.find({
            clinic: req.query.id,
            work_time_start: { $gte: now },
        }).count();

        const totalPage = Math.ceil(totalRows / limit);

        await Job.find({
            clinic: req.query.id,
            work_time_start: { $gte: now },
        })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .sort({ work_time_start: -1 })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);
                res.json({
                    page: page + 1,
                    limit: limit,
                    totalRows: totalRows,
                    totalPage: totalPage,
                    data: output,
                });
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const needApprovedByClinicId = async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * page;

    try {
        const now = DateTime.now().toMillis();

        const totalRows = await Job.find({
            clinic: req.query.id,
            work_time_start: { $gte: now },
            assigned_to: [],
        }).count();

        const totalPage = Math.ceil(totalRows / limit);

        await Job.find({
            clinic: req.query.id,
            work_time_start: { $gte: now },
            assigned_to: [],
        })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .sort({ work_time_start: -1 })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);
                res.json({
                    page: page + 1,
                    limit: limit,
                    totalRows: totalRows,
                    totalPage: totalPage,
                    data: output,
                });
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(404).json({ message: error.message });
    }
};

const bookedBy = async (req, res) => {
    try {
        const job = await Job.findById(req.query.jobId);

        const users = [];

        const promisedUser = job.booked_by.map(async (item) => {
            const user = await User.findById(item).select({
                _id: 1,
                phone_number: 1,
                full_name: 1,
                profile_pict: 1,
                role: 1,
            });
            users.push(user);
        });

        await Promise.all(promisedUser);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCalendarJobByClinicId = async (req, res) => {
    try {
        const amontOfDays = DateTime.local(
            parseFloat(req.params.year),
            parseFloat(req.params.month)
        ).daysInMonth;

        const jobsInMonth = [];

        for (i = 0; i < amontOfDays; i++) {
            date = DateTime.fromISO(req.params.year + req.params.month).plus({
                days: i,
            });
            await Job.find({
                clinic: req.params.clinicId,
                profession: req.user.role,
                work_time_start: {
                    $gte: date.startOf("day").toMillis(),
                    $lte: date.endOf("day").toMillis(),
                },
            })
                .select({ clinic: 1, work_time_start: 1, work_time_finish: 1 })
                .lean()
                .then((data) => {
                    const jobInDay = {};
                    jobInDay.date = i + 1;
                    data.map((e) => {
                        e.work_time_start =
                            DateTime.fromMillis(e.work_time_start)
                                .setZone("Asia/Singapore")
                                .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
                        e.work_time_finish =
                            DateTime.fromMillis(e.work_time_finish)
                                .setZone("Asia/Singapore")
                                .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
                    });
                    jobInDay.data = data;
                    jobsInMonth.push(jobInDay);
                });
        }

        jobLogger.info(req.originalUrl);
        return res.json(jobsInMonth);
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
    }
};

const saveJob = async (req, res) => {
    let data = req.body;
    data.work_time_start =
        DateTime.fromISO(req.body.date + "T" + req.body.work_time_start, {
            zone: "Asia/Singapore",
        }).toMillis() ?? 0;
    data.work_time_finish =
        DateTime.fromISO(req.body.date + "T" + req.body.work_time_finish, {
            zone: "Asia/Singapore",
        }).toMillis() ?? 0;
    data.date =
        DateTime.fromISO(req.body.date, {
            zone: "Asia/Singapore",
        }).toMillis() ?? 0;

    const job = new Job(data);

    try {
        const savedJob = await job.save();
        jobLogger.info(req.originalUrl);
        res.status(200).json(savedJob);
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(400).json({ message: error.message });
    }
};

const updateJob = async (req, res) => {
    const jobId = await Job.findById(req.params.id);
    if (!jobId)
        return res.status(404).json({ message: "The job is not found." });
    try {
        const updatedJob = await Job.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        jobLogger.info(req.originalUrl);
        res.status(200).json(updatedJob);
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(400).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const jobId = await Job.findById(req.params.id);
        if (!jobId)
            return res.status(404).json({ message: "The job is not found." });
        const deletedJob = await Job.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        jobLogger.info(req.originalUrl);
        res.status(200).json(deletedJob);
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(400).json({ message: error.message });
    }
};

//Searching Jobs
const filteredJob = async (req, res) => {
    let filters = {};

    // filters.prefered_gender = req.query.gender
    // filters.price = { $gte: req.query.pricefrom, $lte: req.query.priceto }

    // work_time_start: req.query.timefrom,
    // work_time_finish: req.query.timeto,
    // date: { $gte: req.query.datefrom, $lte: req.query.dateto }

    if (req.query.gender == "both") {
        delete filters.prefered_gender;
    }

    await Job.find({ ...filters })
        .populate("clinic")
        .then((jobs) => {
            // jobs.filter((e) => e.clinic.location == req.query.location)
            a = jobs.filter(
                (e) => e.clinic.clinicName.search(req.query.clinic) >= 0
            );
            // for(let i=0; i<jobs.length; i++) {
            //     for(let key in jobs[i]) {
            //       if(jobs[i][key].indexOf(toSearch)!=-1) {
            //         // if(!itemExists(results, objects[i])) results.push(objects[i]);
            //       }
            //     }
            //   }
            // jobs.filter((e) => e.match(/gem/))

            jobLogger.info(req.originalUrl);
            res.json(a);
        })
        .catch((error) => {
            jobLogger.error(
                `url: ${req.originalUrl}, error: ${error.message}, user:${
                    req.user._id
                }, data : ${JSON.stringify(req.body)}`
            );
            res.status(500).json({ message: error.message });
        });
};

//Searching Jobs
const searchJob = async (req, res) => {
    await Job.find()
        .populate("clinic")
        .then((jobs) => {
            let data = [];
            jobs.filter((e) => {
                if (
                    e.clinic.location.toLowerCase() ==
                    req.query.keyword.toLowerCase()
                ) {
                    data.push(e);
                }
            });
            jobs.filter((e) => {
                let clinic = e.clinic.clinicName.toLowerCase();
                if (clinic.search(req.query.keyword.toLowerCase()) > -1) {
                    data.push(e);
                }
            });

            const unique = [...new Set(data.map((item) => item))];

            unique.map((e, index) => {
                e.number = "";
                statusJob(e, req);
                e.duration = Duration.fromMillis(
                    e.work_time_finish - e.work_time_start
                )
                    .shiftTo("hours")
                    .toObject();
            });

            const output = formatData(unique);
            jobLogger.info(req.originalUrl);
            res.json(output);
        })
        .catch((error) => {
            jobLogger.error(
                `url: ${req.originalUrl}, error: ${error.message}, user:${
                    req.user._id
                }, data : ${JSON.stringify(req.body)}`
            );
            res.status(500).json({ message: error.message });
        });
};

const youMightLike = async (req, res) => {
    try {
        const now = DateTime.now().toMillis();

        const personal = await personalInormation
            .findOne({
                user_id: req.user._id,
            })
            .populate("user_id");

        const blaclistedClinics = [];
        const bClinics = await Clinic.find({
            blacklist: { $in: [req.user._id] },
        }).then((data) => {
            data.map((d) => {
                blaclistedClinics.push(d._id);
            });
        });

        const jobs = await Job.find({
            work_time_start: {
                $gte: now,
            },
            prefered_gender: personal.gender,
            clinic: {
                $nin: blaclistedClinics,
            },
        })
            .populate({
                path: "clinic",
                select: "clinicName Address whitelist",
            })
            .lean();

        const recentClinics = [];
        await Attendance.find({
            check_in: { $gte: now - 259200000 },
            user_id: req.user._id,
        }).then((data) => {
            data.map((d) => {
                recentClinics.push(d.clinic_id.toString());
            });
        });

        const ranks = jobs.map((d) => {
            score = 0;
            if (d.isUrgent == true) {
                score += 30;
            }

            if (d.clinic.whitelist?.includes(req.user._id)) {
                score1 = score + 40;
                score = score1;
            }

            if (recentClinics.includes(d.clinic._id.toString())) {
                score1 = score + 20;
                score = score1;
            }

            d.score = score;
            return d;
        });

        promisedRanks = await Promise.all(ranks);
        promisedRanks.sort((a, b) => {
            return b.score - a.score;
        });
        const output = formatData(promisedRanks);

        jobLogger.info(req.originalUrl);

        res.json(output);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const statusJob = (e, req) => {
    if (e.completed == true) {
        e.status = "Booking Completed";
    } else if (e.canceled_by?.length > 0) {
        e.status = "Booking Cancelled";
    } else if (
        e.booked_by.includes(req.user._id) &&
        !e.assigned_to.includes(req.user._id)
    ) {
        e.status = "Booking Pending";
    } else if (e.assigned_to.includes(req.user._id)) {
        e.status = "Booking Approved";
    } else {
        e.status = "Booking Opened";
    }

    if (e.favorites) {
        if (e.favorites.includes(req.user._id)) {
            e.isFavorite = "true";
        } else {
            e.isFavorite = "false";
        }
    } else {
        e.isFavorite = "false";
    }
};

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
            isFavorite: e.isFavorite ?? "false",
            image: process.env.BASE_URL + e.image,
            number: e.number,
            duration: Duration.fromMillis(
                e.work_time_finish - e.work_time_start
            )
                .shiftTo("hours")
                .toObject(),
            priceDuration:
                Duration.fromMillis(e.work_time_finish - e.work_time_start)
                    .shiftTo("hours")
                    .toObject().hours * e.price,
            time_start_format: DateTime.fromMillis(e.work_time_start)
                .setZone("Asia/Singapore")
                .toLocaleString(DateTime.TIME_SIMPLE),
            time_finish_format: DateTime.fromMillis(e.work_time_finish)
                .setZone("Asia/Singapore")
                .toLocaleString(DateTime.TIME_SIMPLE),
            date_format: DateTime.fromMillis(e.date)
                .setZone("Asia/Singapore")
                .toFormat("dd LLLL yyyy"),
            day: DateTime.fromMillis(e.date)
                .setZone("Asia/Singapore")
                .toFormat("cccc"),
        };
    });
};

const favoritesByUser = async (req, res) => {
    try {
        const favorites = await Job.find({
            favorites: { $in: [req.params.userId] },
        })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });
                jobLogger.info(req.originalUrl);
                res.json(formatData(data));
            })
            .catch((error) => {
                jobLogger.error(
                    `url: ${req.originalUrl}, error: ${error.message}, user:${
                        req.user._id
                    }, data : ${JSON.stringify(req.body)}`
                );
                res.status(500).json({ message: error.message });
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
    }
};

const setFavorite = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).lean();
        if (job.favorites.includes(req.user._id)) {
            const filter = job.favorites.filter((el) => el !== req.user._id);
            job.favorites = filter;
            job.isFavorite;
            await Job.updateOne({ _id: req.params.jobId }, { $set: job }).then(
                () => {
                    res.json({
                        message:
                            " You have successfully removed this job from your favorites",
                    });
                }
            );
        } else {
            job.favorites.push(req.user._id);
            await Job.updateOne({ _id: req.params.jobId }, { $set: job }).then(
                () => {
                    jobLogger.info(req.originalUrl);
                    res.json({
                        message:
                            'You have successfully saved this listing under "Favorites".',
                    });
                }
            );
        }
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${
                req.user._id
            }, data : ${JSON.stringify(req.body)}`
        );
        res.status(500).json({ message: error.message });
    }
};

const getCurrentJob = async (req, res) => {
    try {
        const now = DateTime.now().toMillis();

        const jobs = await Job.find({
            assigned_to: {
                $in: [req.user._id],
            },
            work_time_start: {
                $lte: now,
            },
            work_time_finish: {
                $gte: now,
            },
        })
            .lean()
            .populate({ path: "clinic", select: "clinicName Address" })
            .then((data) => {
                data.map((e, index) => {
                    e.number = "";
                    statusJob(e, req);
                    e.duration = Duration.fromMillis(
                        e.work_time_finish - e.work_time_start
                    )
                        .shiftTo("hours")
                        .toObject();
                });

                const output = formatData(data);
                jobLogger.info(req.originalUrl);
                res.json(output);
            });
    } catch (error) {
        jobLogger.error(
            `url: ${req.originalUrl}, error: ${error.message}, user:${req.user._id}`
        );
        res.status(500).json({ message: error.message });
    }
};

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
    upcomingByClinicId,
    getUpcomingDoctorJobs,
    getUpcomingClinicalAssistantJobs,
    getCalendarJobByClinicId,
    youMightLike,
    filteredJob,
    searchJob,
    statusJob,
    formatData,
    getExploreJobs,
    getCurrentJob,
    favoritesByUser,
    setFavorite,
    bookedBy,
    needApprovedByClinicId,
};
