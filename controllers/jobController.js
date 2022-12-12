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
const { info } = require("winston");
const ObjectId = require("mongoose/lib/types/objectid.js");

const getAllJobs = async (req, res) => {
  try {
    await Job.find()
      .sort({ date: 1 })
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .then((data) => {
        data.map((e, index) => {
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
    const now = DateTime.now().toMillis();

    await Job.find({
      profession: req.user.role,
      work_time_start: { $gt: now },
      booked_by: { $nin: req.user._id },
      assigned_to: [],
    })
      .sort({ createdAt: -1 })
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .then((data) => {
        data.map((e, index) => {
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
      profession: req.user.role,
      booked_by: { $nin: req.user._id },
      assigned_to: [],
    })
      .sort({ date: 1 })
      .select({
        _id: 1,
        code: 1,
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
        favorites: 1,
      })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName Address",
      })
      .then((data) => {
        data.map((e, index) => {
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
        code: 1,
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
        favorites: 1,
      })
      .then((data) => {
        data.map((e, index) => {
          statusJob(e, req);
          e.duration = Duration.fromMillis(
            e.work_time_finish - e.work_time_start
          )
            .shiftTo("hours")
            .toObject();
        });

        const upcoming = data.filter(function (el) {
          return (
            el.status == "Booking Approved" || el.status == "Booking Pending"
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
        code: 1,
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
        favorites: 1,
      })
      .then((data) => {
        data.map((e, index) => {
          statusJob(e, req);
          e.duration = Duration.fromMillis(
            e.work_time_finish - e.work_time_start
          )
            .shiftTo("hours")
            .toObject();
        });

        const upcoming = data.filter(function (el) {
          return (
            el.status == "Booking Approved" || el.status == "Booking Pending"
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
        code: 1,
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
        favorites: 1,
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
        data.work_time_finish = DateTime.fromMillis(data.work_time_finish)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE);
        data.day = DateTime.fromMillis(data.date)
          .setZone("Asia/Singapore")
          .toFormat("cccc");
        data.date = DateTime.fromMillis(data.date)
          .setZone("Asia/Singapore")
          .toFormat("dd LLLL yyyy");

        if (data.favorites) {
          if (data.favorites.includes(req.user._id)) {
            data.isFavorite = true;
          } else {
            data.isFavorite = false;
          }
        } else {
          data.isFavorite = false;
        }

        delete data.favorites;

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
  const limit = parseInt(req.query.limit) || 100;
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
  const limit = parseInt(req.query.limit) || 100;
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

const EmptySlotsByClinicId = async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 100;
  const offset = limit * page;

  try {
    const now = DateTime.now().toMillis();

    const totalRows = await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: [],
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: [],
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .sort({ work_time_start: -1 })
      .then((data) => {
        data.map((e, index) => {
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
  const limit = parseInt(req.query.limit) || 100;
  const offset = limit * page;

  try {
    const now = DateTime.now().toMillis();

    const totalRows = await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: { $ne: [] },
      assigned_to: [],
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: { $ne: [] },
      assigned_to: [],
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .sort({ work_time_start: -1 })
      .then((data) => {
        data.map((e, index) => {
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

const filledSlotsByClinicId = async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 100;
  const offset = limit * page;

  try {
    const now = DateTime.now().toMillis();

    const totalRows = await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: { $ne: [] },
      assigned_to: { $ne: [] },
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      clinic: req.query.id,
      work_time_start: { $gte: now },
      booked_by: { $ne: [] },
      assigned_to: { $ne: [] },
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .sort({ work_time_start: -1 })
      .then((data) => {
        data.map((e, index) => {
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
      const user = await User.findById(item)
        .select({
          _id: 1,
          phone_number: 1,
          full_name: 1,
          profile_pict: 1,
          role: 1,
          role_id: 1,
        })
        .lean();

      user.profile_pict =
        user.profile_pict !== ""
          ? process.env.BASE_URL + user.profile_pict
          : "";

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

const postManualListing = (req, res) => {
  req.body.listing_type = "manual_listing";
  saveJob(req, res);
};

const postAutomatedListing = (req, res) => {
  req.body.listing_type = "automated_listing";
  saveJob(req, res);
};

const postDirectListing = (req, res) => {
  const user = User.findOne({ code: req.body.shared_to });
  const assigned_to = [];
  const booked_by = [];

  booked_by.push(user._id);
  assigned_to.push(user._id);

  req.body.listing_type = "direct_listing";
  req.body.assigned_to = assigned_to;
  req.body.booked_by = booked_by;

  saveJob(req, res);
};

const saveJob = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "The image must not empty." });

  const clinic = await Clinic.findById(req.body.clinic).select({ initials: 1 });
  const count = await Job.find({ clinic: ObjectId(req.body.clinic) }).count();
  const number = parseInt(count) + 1;
  const string = clinic.initials + "-000000";

  let data = req.body;
  data.image = "/" + req.file?.destination + "/" + req.file?.filename;
  data.code = string.slice(0, 10 - number.toString().length) + number;

  data.work_time_start = DateTime.fromISO(
    req.body.date + "T" + req.body.work_time_start,
    { zone: "Asia/Singapore" }
  ).toMillis();

  data.work_time_finish = DateTime.fromISO(
    req.body.date + "T" + req.body.work_time_finish,
    { zone: "Asia/Singapore" }
  ).toMillis();

  data.date = DateTime.fromISO(req.body.date, {
    zone: "Asia/Singapore",
  }).toMillis();

  const job = new Job(data);

  try {
    const savedJob = await job.save();
    res.status(200).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  const jobId = await Job.findById(req.params.id);
  if (!jobId) return res.status(404).json({ message: "The job is not found." });
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

const filteredJob = async (req, res) => {
  // return res.json("halo");
  let filters = {};
  filters.role = req.user.role;

  if (req.query.datefrom) {
    const datefrom = DateTime.parse(req.query.datefrom);

    if (!req.query.dateto) {
      return res.status(400).json({ message: "You must select date to " });
    }

    filters.date = {
      $gte: new Date(req.query.datefrom),
      $lt: new Date(req.query.datefrom),
    };
  }

  let sorts = {};
  if (req.query.order === "earlier_to_latest") {
    sorts.order = 1;
  } else {
    sorts.order = -1;
  }

  if (req.query.rate === "lowtohigh") {
    sorts.price = 1;
  } else {
    sorts.price = -1;
  }

  await Job.find({ ...filters })
    .populate("clinic")
    .short({ ...sorts })
    .then((jobs) => {
      if (req.query.location)
        jobs.filter((e) => e.clinic.location == req.query.location);

      a = jobs.filter((e) => e.clinic.clinicName.search(req.query.clinic) >= 0);

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

const searchJob = async (req, res) => {
  let filters = {};
  filters.role = req.user.role;

  if (req.query.datefrom) {
    if (!req.query.dateto) {
      return res.status(400).json({ message: "You must select date to " });
    }

    const datefrom = DateTime.fromISO(req.query.datefrom).toMillis();
    const dateto = DateTime.fromISO(req.query.dateto).toMillis();

    filters.date = {
      $gte: datefrom,
      $lt: dateto,
    };
  }

  let sorts = {};
  if (req.query.order === "earlier_to_latest") {
    sorts.work_time_start = 1;
  } else {
    sorts.work_time_start = -1;
  }

  if (req.query.rate === "lowtohigh") {
    sorts.price = 1;
  } else {
    sorts.price = -1;
  }

  await Job.find({ ...filters })
    .populate("clinic")
    .sort({ ...sorts })
    .then((jobs) => {
      let data = [];
      jobs.filter((e) => {
        if (
          e.clinic.location.toLowerCase() == req.query.keyword.toLowerCase()
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
      jobs.filter((e) => {
        let clinic = e.clinic.clinicAddress.toLowerCase();
        if (clinic.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.clinic.description.toLowerCase();
        if (clinic.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.clinic.code?.toLowerCase();
        if (clinic?.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.clinic.initials?.toLowerCase();
        if (clinic?.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.clinic?.type?.join(" ").toLowerCase();
        if (clinic?.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.scope?.join(" ").toLowerCase();
        if (clinic?.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      jobs.filter((e) => {
        let clinic = e.job_description?.join(" ").toLowerCase();
        if (clinic?.search(req.query.keyword.toLowerCase()) > -1) {
          data.push(e);
        }
      });
      const unique = [...new Set(data.map((item) => item))];

      unique.map((e, index) => {
        statusJob(e, req);
        e.duration = Duration.fromMillis(e.work_time_finish - e.work_time_start)
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

    let jobs = "";

    if (personal) {
      const newjobs = await Job.find({
        work_time_start: {
          $gte: now,
        },
        clinic: {
          $nin: blaclistedClinics,
        },
        booked_by: { $nin: req.user._id },
        assigned_to: [],
      })
        .populate({
          path: "clinic",
          select: "clinicName clinicAddress whitelist",
        })
        .lean();
      jobs = newjobs;
    } else {
      const newjobs = await Job.find({
        work_time_start: {
          $gte: now,
        },
        clinic: {
          $nin: blaclistedClinics,
        },
      })
        .populate({
          path: "clinic",
          select: "clinicName clinicAddress whitelist",
        })
        .lean();

      jobs = newjobs;
    }

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
      statusJob(d, req);
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
      e.isFavorite = true;
    } else {
      e.isFavorite = false;
    }
  } else {
    e.isFavorite = false;
  }
};

const formatData = (data) => {
  return data.map((e) => {
    return {
      _id: e._id,
      code: e.code ?? "",
      clinic: e.clinic ?? "",
      date: e.date ?? "",
      work_time_start: e.work_time_start ?? 0,
      work_time_finish: e.work_time_finish ?? 0,
      break: {
        start: e.break?.start
          ? DateTime.fromMillis(e.break.start)
              .setZone("Asia/Singapore")
              .toLocaleString(DateTime.TIME_SIMPLE)
          : "",
        finish: e.break?.finish
          ? DateTime.fromMillis(e.break.finish)
              .setZone("Asia/Singapore")
              .toLocaleString(DateTime.TIME_SIMPLE)
          : "",
      },
      scope: e.scope ?? [],
      job_description: e.job_description ?? "",
      booked_by: e.booked_by ?? [],
      assigned_to: e.assigned_to ?? [],
      completed: e.completed ?? false,
      canceled_by: e.canceled_by ?? [],
      status: e.status ?? "",
      isFavorite: e.isFavorite ?? false,
      image: process.env.BASE_URL + e.image ?? "",
      price:
        e.urgent_status == "24"
          ? e.urgent_status == "72"
            ? e.urgent_price_24
            : e.urgent_price_72
          : e.price,
      duration: Duration.fromMillis(e.work_time_finish - e.work_time_start)
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
      await Job.updateOne({ _id: req.params.jobId }, { $set: job }).then(() => {
        res.json({
          message:
            " You have successfully removed this job from your favorites",
        });
      });
    } else {
      job.favorites.push(req.user._id);
      await Job.updateOne({ _id: req.params.jobId }, { $set: job }).then(() => {
        jobLogger.info(req.originalUrl);
        res.json({
          message:
            'You have successfully saved this listing under "Favorites".',
        });
      });
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

const getCurrentSlot = async (req, res) => {
  const startOfDay = DateTime.now()
    .setZone("Asia/Singapore")
    .startOf("day")
    .toMillis();

  const endOfDay = DateTime.now()
    .setZone("Asia/Singapore")
    .endOf("day")
    .toMillis();

  try {
    const jobs = await Job.find({
      assigned_to: {
        $in: [req.user._id],
      },
      clinic: ObjectId(req.query.clinicId),
      $or: [
        {
          work_time_start: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
        {
          work_time_finish: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      ],
    })
      .lean()
      .populate({ path: "clinic", select: "clinicName Address" })
      .then((data) => {
        data.map((e, index) => {
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
  saveJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getNewJobs,
  getJobById,
  getPastJobs,
  getCurrentSlot,
  getUpcomingJobs,
  getJobByClinicId,
  upcomingByClinicId,
  EmptySlotsByClinicId,
  filledSlotsByClinicId,
  getUpcomingDoctorJobs,
  getUpcomingClinicalAssistantJobs,
  getCalendarJobByClinicId,
  needApprovedByClinicId,
  postAutomatedListing,
  postDirectListing,
  postManualListing,
  favoritesByUser,
  getExploreJobs,
  getCurrentJob,
  youMightLike,
  filteredJob,
  setFavorite,
  formatData,
  searchJob,
  statusJob,
  bookedBy,
};
