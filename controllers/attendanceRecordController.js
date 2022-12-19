const Record = require("../models/AttendanceRecord.js");
const Doctor = require("../models/Doctor.js");
const Clinic = require("../models/Clinic.js");
const Job = require("../models/Job.js");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const { jobs_v2 } = require("googleapis");
const { Settings } = require("luxon");
Settings.defaultZoneName = "Asia/Singapore";
const User = require("../models/User");

const getData = async (jobId, userId) => {
  const attendance = await Record.findOne({
    job_id: jobId,
    user_id: mongoose.Types.ObjectId(userId),
  });

  const job = await Job.findById(jobId).populate("clinic").lean();

  const now = DateTime.now().toMillis();

  const data = {
    image: job.image ? process.env.BASE_URL + job.image : "",
    clinic_name: job.clinic.clinicName ?? "",
    scope: job.scope ?? "",
    address: job.clinic.clinicAddress,
    price: job.price ?? "",
    date: job.date
      ? DateTime.fromMillis(job.date)
          .setZone("Asia/Singapore")
          .toFormat("dd LLLL yyyy")
      : "",
    time_start: job.work_time_start
      ? DateTime.fromMillis(job.work_time_start)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE)
      : "",
    time_end: job.work_time_finish
      ? DateTime.fromMillis(job.work_time_finish)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE)
      : "",
  };

  if (job.assigned_to?.includes(userId)) {
    if (attendance) {
      if (
        Math.abs(job.work_time_start - now) > 3600000 &&
        attendance.check_in == null
      ) {
        data.status = "Not Yet";
      } else if (attendance.check_in == null) {
        data.status = "Ready";
      } else if (attendance.check_in != null && attendance.check_out == null) {
        data.status = "In Progress";
      } else if (attendance.check_out != null) {
        data.status = "Completed";
      }
    } else {
      data.status = "Ready";
    }
  } else {
    data.status = "Not Applicable";
  }

  return data;
};

const getNewAttendance = async (req, res) => {
  try {
    const data = await getData(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkin = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;
    const time = DateTime.now().toMillis();
    const checkin = await setCheckin(jobId, userId, time);

    res.status(checkin.status).json(checkin.message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkinByAdmin = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.body.user_id;

    const job = await Job.findById(jobId);
    const date = DateTime.fromMillis(job.date).toFormat("yyyy-MM-dd");
    const timeQuery = req.body.time;
    const time = DateTime.fromISO(date + "T" + timeQuery, {
      zone: "Asia/Singapore",
    }).toMillis();

    const checkin = await setCheckin(jobId, userId, time);

    res.status(checkin.status).json(checkin.message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setCheckin = async (jobId, userId, time) => {
  const data = await getData(jobId, userId);
  if (data.status === "Ready") {
    const job = await Job.findById(jobId);

    const attendance = await Record.find({
      job_id: jobId,
      user_id: userId,
    }).lean();

    if (attendance.length === 0) {
      const record = new Record({
        job_id: jobId,
        user_id: userId,
        clinic_id: job.clinic,
        check_in: time,
      });
      const savedRecord = record.save();
    } else {
      attendance.check_in = time;

      await Record.updateOne(
        {
          job_id: jobId,
          user_id: userId,
        },
        { $set: attendance }
      );
    }

    return {
      status: 200,
      message: "You have checkin successfully.",
    };
  } else if (data.status === "In Progress") {
    return { status: 403, message: "You have checkin." };
  } else if (data.status === "Completed") {
    return { status: 403, message: "The slot has been completed." };
  } else {
    return {
      status: 403,
      message: "Please Check the slot.",
    };
  }
};

const checkout = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;
    const checkout = await setCheckout(jobId, userId);

    res.status(checkout.status).json(checkout.message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkoutByAdmin = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.body.user_id;

    const job = await Job.findById(jobId);
    const date = DateTime.fromMillis(job.date).toFormat("yyyy-MM-dd");
    const timeQuery = req.body.time;
    const time = DateTime.fromISO(date + "T" + timeQuery, {
      zone: "Asia/Singapore",
    }).toMillis();

    const checkout = await setCheckout(jobId, userId, time);

    res.status(checkout.status).json(checkout.message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setCheckout = async (jobId, userId) => {
  const data = await getData(jobId, userId);
  if (data.status === "Ready") {
    return { status: 403, message: "You have to checkin before checkout!" };
  } else if (data.status === "Completed") {
    return { status: 403, message: "You have already checkout" };
  } else if (data.status === "In Progress") {
    const attendance = await Record.findOneAndUpdate(
      {
        job_id: jobId,
        user_id: userId,
      },
      { check_out: DateTime.now().toMillis() }
    );
    await Job.updateOne({ _id: jobId }, { completed: true });
    return { message: "You have successfully check-out", status: 200 };
  } else {
    return {
      status: 403,
      message: "You are not allowed to checkout. Please check the job!",
    };
  }
};

const afterCheckout = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return res.status(404).json({ message: "The Slot not found." });

    const workHour = job.work_time_finish - job.work_time_start;
    let clinic = await Clinic.findById(job.clinic).lean();
    const comments = clinic.comments;
    comments.push({
      userId: req.user._id,
      text: req.body.text,
      datetime: DateTime.now().toMillis(),
    });

    await Clinic.updateOne(
      { _id: job.clinic },
      { $set: { comments: comments } }
    );

    const record1 = await Record.findOne({
      job_id: req.params.jobId,
      user_id: req.user._id,
    });

    if (!record1)
      return res.status(404).json({ message: "You may have not checkin yet" });

    const record = await Record.updateOne(
      { job_id: req.params.jobId, user_id: req.user._id },
      {
        $set: {
          overtime: req.body.overtime,
          totalWorkHour: (req.body.overtime * 60000 + workHour) / 3600000,
          remarks: req.body.remarks,
        },
      }
    );

    res.json({ message: "Thank You. Have a nice day." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentUserByDay = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    const day = parseInt(req.query.date);

    const date = DateTime.local(year, month, day, {
      zone: "Asia/Singapore",
    });

    const startOfDay = date.startOf("day").toMillis();
    const endOfDay = date.endOf("day").toMillis();

    const job = await Job.find({
      clinic: req.query.clinicId,
      $or: [
        { work_time_start: { $gte: startOfDay, $lt: endOfDay } },
        { work_time_finish: { $gte: startOfDay, $lt: endOfDay } },
      ],
    })
      .select({ assigned_to: 1 })
      .lean();

    const users = [];
    const getUsers = job.map(async (item) => {
      item.users = [];

      const pushUsers = item.assigned_to.map(async (userId) => {
        const user = await User.findById(userId)
          .select({
            full_name: 1,
            role: 1,
            role_id: 1,
          })
          .lean();
        user.job_id = item._id;
        users.push(user);
      });

      await Promise.all(pushUsers);
      // users.push(item.users);
    });

    await Promise.all(getUsers);

    // const user = job.assigned_to;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkin,
  checkout,
  afterCheckout,
  checkinByAdmin,
  checkoutByAdmin,
  getNewAttendance,
  getAppointmentUserByDay,
};
