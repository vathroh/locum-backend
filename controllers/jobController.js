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
const Preference = require("../models/Preference.js");
const { setUrgentJobStatus } = require("../utils/job/setUrgentJob/index.js");
const { checkPair } = require("../services/preferencesPair/checkPair");
const sendFCM = require("../services/notification/fcm/index.js");
const Device = require("../models/Device.js");

const getAllJobs = async (req, res) => {
  try {
    await Job.find()
      .sort({ date: 1 })
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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
        select: "clinicName clinicAddress",
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
        select: "clinicName clinicAddress",
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress description type",
      })
      .exec(async (err, data) => {
        statusJob(data, req);
        data.image = data.image ? process.env.BASE_URL + data.image : "";
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
        data.break = {
          start: data.break?.start
            ? DateTime.fromMillis(data.break.start)
                .setZone("Asia/Singapore")
                .toLocaleString(DateTime.TIME_SIMPLE)
            : "",
          finish: data.break?.finish
            ? DateTime.fromMillis(data.break.finish)
                .setZone("Asia/Singapore")
                .toLocaleString(DateTime.TIME_SIMPLE)
            : "",
        };

        if (data.urgent_status == "24") {
          data.price = data.urgent_price_24;
        } else if (data.urgent_status == "72") {
          data.price = data.urgent_price_72;
        }

        delete data.urgent_price_24;
        delete data.urgent_price_72;

        const preferences = [];
        const getPreferences = data.preferences.map(async (preference) => {
          const item = await Preference.findById(preference);
          preferences.push(item.item);
        });
        await Promise.all(getPreferences);
        data.preferences = preferences;

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

  let filters = {};
  filters.clinic = req.query.id;

  if (req.query.profession) {
    filters.profession = req.query.profession;
  }

  try {
    const totalRows = await Job.find({ ...filters }).count();
    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({ ...filters })
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
    let filters = {};
    filters.clinic = req.query.id;
    filters.work_time_start = { $gte: now };

    if (req.query.profession) {
      filters.profession = req.query.profession;
    }

    const totalRows = await Job.find({ ...filters }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      ...filters,
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
  const now = DateTime.now().toMillis();

  let filters = {};
  filters.clinic = req.query.id;
  filters.work_time_start = { $gte: now };
  filters.booked_by = [];
  filters.work_time_start = { $gte: now };

  if (req.query.profession) {
    filters.profession = req.query.profession;
  }

  try {
    const totalRows = await Job.find({
      ...filters,
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      ...filters,
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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

  const now = DateTime.now().toMillis();
  let filters = {};
  filters.clinic = req.query.id;
  filters.work_time_start = { $gte: now };
  filters.assigned_to = [];

  if (req.query.profession) {
    filters.profession = req.query.profession;
  }

  try {
    const totalRows = await Job.find({
      ...filters,
      $or: [
        {
          booked_by: { $ne: [] },
        },
        { rejected: { $ne: [] } },
      ],
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      ...filters,
      $or: [
        {
          booked_by: { $ne: [] },
        },
        { rejected: { $ne: [] } },
      ],
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
  const now = DateTime.now().toMillis();

  let filters = {};
  filters.clinic = req.query.id;
  filters.work_time_start = { $gte: now };
  filters.booked_by = { $ne: [] };
  filters.assigned_to = { $ne: [] };

  if (req.query.profession) {
    filters.profession = req.query.profession;
  }

  try {
    const totalRows = await Job.find({
      ...filters,
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    await Job.find({
      ...filters,
    })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
      .sort({ work_time_start: -1 })
      .then(async (data) => {
        const users = [];
        const newdata = formatData(data);

        console.log(newdata);

        const promised = newdata.map(async (e, index) => {
          const user = await User.findById(e.assigned_to[0])
            .select({
              full_name: 1,
              role_id: 1,
              phone_number: 1,
              role: 1,
              profile_pict: 1,
            })
            .lean();

          if (user) {
            user.job_id = e._id;
            user.price = e.price;
            user.priceDuration = e.priceDuration;
            user.date_format = e.date_format;
            user.time_start_format = e.time_start_format;
            user.time_finish_format = e.time_finish_format;
            if (user.profile_pict !== "") {
              user.profile_pict = process.env.BASE_URL + user.profile_pict;
            }
            users.push(user);
          }
        });

        await Promise.all(promised);

        res.json(users);
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
    const now = DateTime.now().toMillis();
    const job = await Job.findById(req.query.jobId);

    if (!job)
      return res.status(404).json({ message: "The slot can not be found." });

    const users = [];
    const booked_by = job.booked_by;

    job.rejected.map((item) => {
      booked_by.push(item);
    });

    const promisedUser = booked_by.map(async (item) => {
      const user = await User.findById(item)
        .select({
          _id: 1,
          phone_number: 1,
          full_name: 1,
          profile_pict: 1,
          role: 1,
          role_id: 1,
          preferences: 1,
        })
        .lean();

      const isHasAppointment = await Job.findOne({
        assigned_to: { $in: [item] },
        $or: [
          {
            work_time_start: {
              $gte: job.work_time_start,
              $lt: job.work_time_finish,
            },
          },
          {
            work_time_finish: {
              $gte: job.work_time_start,
              $lt: job.work_time_finish,
            },
          },
        ],
      });

      const prefs = [];
      job.preferences.map((item) => {
        if (user.preferences.includes(item)) {
          prefs.push(true);
        } else {
          prefs.push(false);
        }
      });

      if (job.rejected.includes(item)) {
        user.booked_status = "rejected";
      } else if (isHasAppointment) {
        user.booked_status = "hasAppointment";
      } else if (prefs.includes(false) && !isHasAppointment) {
        user.booked_status = "notMeetPreferences";
      } else if (!prefs.includes(false) && !isHasAppointment) {
        user.booked_status = "meetPreferences";
      } else {
        user.booked_status = "";
      }

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

const duplicateJob = async (req, res) => {
  const job = await Job.findById(req.params.jobId).lean();

  if (!job)
    return res.status(404).json({ message: "The slot cannot be found." });

  const newJob = job;
  delete newJob._id;
  delete newJob.code;
  delete newJob.createdAt;
  delete newJob.updatedAt;
  delete newJob.__v;
  newJob.booked_by = [];
  newJob.assigned_to = [];
  newJob.canceled_by = [];
  newJob.rejected = [];
  newJob.completed = false;
  req.body = newJob;

  // return res.json(newJob);
  saveJob(req, res);
};

const postManualListing = (req, res) => {
  req.body.listing_type = "manual_listing";
  saveJob(req, res);
};

const postAutomatedListing = (req, res) => {
  req.body.listing_type = "automated_listing";
  saveJob(req, res);
};

const postDirectListing = async (req, res) => {
  req.body.listing_type = "direct_listing";
  const data = await sharedTo(req.body);

  if (data.status === 400) {
    return res.status(data.status).json({ message: data.message });
  }

  req.body = data;

  await saveJob(req, res);
};

const sharedTo = async (data) => {
  const user = await User.findOne({ role_id: data.shared_to });
  const assigned_to = [];
  const booked_by = [];

  booked_by.push(user._id.toString());
  assigned_to.push(user._id.toString());

  data.booked_by = booked_by;
  data.assigned_to = assigned_to;

  if (data.profession === "doctor" && user.role !== "doctor") {
    return {
      status: 400,
      message: `Please select approriate profession for your slot.`,
    };
  }

  if (
    data.profession === "clinical assistant" &&
    user.role !== "clinic_assistants"
  ) {
    return {
      status: 400,
      message: `Please select approriate profession for your slot.`,
    };
  }
  return data;
};

const saveJob = async (req, res) => {
  if (!req.file) req.body.image = "";

  const clinic = await Clinic.findById(req.body.clinic).select({
    initials: 1,
    clinicName: 1,
  });
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
  req.body.code = string.slice(0, 10 - number.toString().length) + number;

  const check = await checkPair(req.body.preferences);

  if (check?.status === 400)
    return res.status(check.status).json({ message: check.message });

  const checkCriteria = await checkPair(req.body.criterias);

  if (checkCriteria?.status === 400)
    return res
      .status(checkCriteria?.status)
      .json({ message: "Please check criteria items." });

  const data = await postData(req, res);

  if (
    parseInt(data.work_time_finish) - parseInt(data.work_time_start) <
    3600000
  ) {
    return res
      .status(400)
      .json({ message: "The slot must have over 1 hour work time." });
  }

  if (data.urgent_price_24 == 0) delete data.urgent_price_24;
  if (data.urgent_price_72 == 0) delete data.urgent_price_72;

  const job = new Job(data);

  try {
    console.log(data);
    const savedJob = await job.save();

    let users = [];

    if (data.profession == "doctor") {
      users = await User.find({ role: "doctor" });
    } else if (data.profession == "clinical assistant") {
      users = await User.find({ role: "clinic_assistants" });
    }

    const deviceIds = [];

    const promisedDevice = users.map(async (user) => {
      await Device.find({ user_id: user._id }).then((devices) => {
        devices.map((device) => {
          deviceIds.push(device.device_id);
        });
      });
    });

    await Promise.all(promisedDevice);

    let notification = {
      title: "New slot has been posted.",
      body: `${clinic.clinicName} has  posted a slot.`,
    };

    let notification_body = {
      notification: notification,
      registration_ids: deviceIds,
    };

    sendFCM(notification_body);

    res.status(200).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const postData = async (req, res) => {
  let data = req.body;
  if (req.file) {
    data.image = "/" + req.file?.destination + "/" + req.file?.filename;
  } else {
    delete data.image;
  }

  data.break = {};
  if (typeof req.body.work_time_start == "string") {
    data.work_time_start = DateTime.fromISO(
      req.body.date + "T" + req.body.work_time_start,
      { zone: "Asia/Singapore" }
    ).toMillis();
  }

  if (typeof req.body.work_time_finish == "string") {
    data.work_time_finish = DateTime.fromISO(
      req.body.date + "T" + req.body.work_time_finish,
      { zone: "Asia/Singapore" }
    ).toMillis();
  }

  if (typeof req.body.break_start == "string") {
    data.break.start = req.body.break_start
      ? DateTime.fromISO(req.body.date + "T" + req.body.break_start, {
          zone: "Asia/Singapore",
        }).toMillis()
      : 0;
  }

  if (typeof req.body.break_finish == "string") {
    data.break.finish = req.body.break_finish
      ? DateTime.fromISO(req.body.date + "T" + req.body.break_finish, {
          zone: "Asia/Singapore",
        }).toMillis()
      : 0;
  }

  if (typeof req.body.date == "string") {
    const a = DateTime.fromISO(req.body.date + "T" + req.body.break_start, {
      zone: "Asia/Singapore",
    }).toMillis();
  }

  if (typeof req.body.date == "string") {
    data.date = DateTime.fromISO(req.body.date, {
      zone: "Asia/Singapore",
    }).toMillis();
  }

  let body = data;
  if (data.listing_type == "direct_listing") {
    body = await sharedTo(data);
  }

  setUrgentJobStatus(body);

  return body;
};

const updateJob = async (req, res) => {
  const jobId = await Job.findById(req.params.id);
  if (!jobId)
    return res.status(404).json({ message: "The slot is not found." });
  try {
    const check = await checkPair(req.body.preferences);

    if (check?.status === 400)
      return res.status(check.status).json({ message: check.message });

    const checkCriteria = await checkPair(req.body.criterias);

    if (checkCriteria?.status === 400)
      return res
        .status(checkCriteria?.status)
        .json({ message: "Please check criteria items." });

    const data = await postData(req, res);
    const updatedJob = await Job.updateOne(
      { _id: req.params.id },
      { $set: data }
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

      jobs.filter((e) => {
        let clinic = e.clinic.location.toLowerCase();
        if (clinic.search(req.query.keyword.toLowerCase()) > -1) {
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
    let price = 0;
    if (e.urgent_status == "24") {
      price = e.urgent_price_24 ?? e.price;
    } else if (e.urgent_status == "72") {
      price = e.urgent_price_72 ?? e.price;
    } else {
      price = e.price;
    }

    return {
      _id: e._id,
      code: e.code ?? "",
      clinic: {
        _id: e.clinic._id,
        clinicName: e.clinic.clinicName ?? "",
        clinicAddress: e.clinic.clinicAddress ?? "",
      },
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
      job_description: e.job_description ?? [],
      booked_by: e.booked_by ?? [],
      assigned_to: e.assigned_to ?? [],
      completed: e.completed ?? false,
      canceled_by: e.canceled_by ?? [],
      status: e.status ?? "",
      isFavorite: e.isFavorite ?? false,
      image: process.env.BASE_URL + e.image ?? "",
      price: price,
      duration: Duration.fromMillis(e.work_time_finish - e.work_time_start)
        .shiftTo("hours")
        .toObject(),
      priceDuration:
        Duration.fromMillis(e.work_time_finish - e.work_time_start)
          .shiftTo("hours")
          .toObject().hours * price,
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
      .populate({ path: "clinic", select: "clinicName clinicAddress" })
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
  duplicateJob,
  filteredJob,
  setFavorite,
  formatData,
  searchJob,
  statusJob,
  bookedBy,
};
