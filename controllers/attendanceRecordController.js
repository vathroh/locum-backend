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

const getData = async (req, res) => {
  const attendance = await Record.findOne({
    job_id: req.params.jobId,
    user_id: mongoose.Types.ObjectId(req.user._id),
  });

  const job = await Job.findById(req.params.jobId).populate("clinic").lean();

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

  if (job.assigned_to.includes(req.user._id)) {
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
    const data = await getData(req, res);
    if (data.status === "Ready") {
      const job = await Job.findById(req.params.jobId);

      const attendance = await Record.find({
        job_id: req.params.jobId,
        user_id: req.user._id,
      }).lean();

      if (attendance.length === 0) {
        const record = new Record({
          job_id: req.params.jobId,
          user_id: req.user._id,
          clinic_id: job.clinic,
          check_in: DateTime.now().toMillis(),
        });
        const savedRecord = record.save();
      } else {
        attendance.check_in = DateTime.now().toMillis();
        const updatedRecord = await Record.updateOne(
          {
            job_id: req.params.jobId,
            user_id: req.user._id,
          },
          { $set: attendance }
        );
      }

      res.json({ message: "You are successfully check-in" });
    } else if (data.status === "In Progress") {
      res.status(403).json({
        message: "You have checkin.",
      });
    } else if (data.status === "Completed") {
      res.status(403).json({
        message: "You have completed this job.",
      });
    } else {
      res.status(403).json({
        message: "You are not allowed to checkin. Please check the job.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    const data = await getData(req, res);
    if (data.status === "Ready") {
      res.status(403).json({
        message: "You have to checkin before checkout!",
      });
    } else if (data.status === "Completed") {
      res.status(403).json({ message: "You have checkout" });
    } else if (data.status === "In Progress") {
      const attendance = await Record.findOneAndUpdate(
        {
          job_id: req.params.jobId,
          user_id: req.user._id,
        },
        { check_out: DateTime.now().toMillis() }
      );
      await Job.updateOne({ _id: req.params.jobId }, { completed: true });
      return res.json({ message: "You are successfully check-out" });
    } else {
      res.status(403).json({
        message: "You are not allowed to checkout. Please check the job!",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    job.users = [];
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
        item.users.push(user);
      });

      await Promise.all(pushUsers);
      job.users.push(item.users);
    });

    await Promise.all(getUsers);

    // const user = job.assigned_to;
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkin,
  checkout,
  afterCheckout,
  getNewAttendance,
  getAppointmentUserByDay,
};
