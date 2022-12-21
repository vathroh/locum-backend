const Job = require("../models/Job.js");
const moment = require("moment");
const { DateTime, Duration } = require("luxon");
const { saveEvent } = require("./calendarController.js");
const Clinic = require("../models/Clinic.js");
const { statusJob, formatData } = require("./jobController");
const User = require("../models/User.js");
const { restart } = require("nodemon");
const ObjectId = require("mongoose/lib/types/objectid.js");
const { sendingEmail } = require("../services/sendingEmail");
const { jobLogger } = require("../services/logger/jobLogger");
const ClinicGroup = require("../models/ClinicGroup");

const {
  createEvent,
  deleteEvent,
} = require("../services/googleCalendar/index");

const {
  createConversation,
  sendMessage,
} = require("../services/sendingChat/index.js");
const Calendar = require("../models/Calendar.js");

const createBooking = async (req, res) => {
  const user_id = ObjectId.isValid(req.body.user_id);
  if (!user_id) return res.status(400).json({ message: "user_id is invalid" });

  const job_id = ObjectId.isValid(req.params.id);
  if (!job_id) return res.status(400).json({ message: "job_id is invalid" });

  const jobId = await Job.findById(req.params.id).populate({
    path: "clinic",
    select: "clinicName clinicAddress",
  });

  const hasAppointment = await Job.findOne({
    assigned_to: { $in: [req.user._id] },
    work_time_start: {
      $gte: jobId.work_time_start,
      $lt: jobId.work_time_finish,
    },
  });

  if (!jobId)
    return res.status(404).json({ message: "The listing is not found." });

  if (hasAppointment)
    return res
      .status(404)
      .json({ message: "You have an appointment at this slot time." });

  let hasUserBooked = jobId.booked_by.includes(req.user._id);

  if (!hasUserBooked) {
    let updatedData = jobId;

    updatedData.booked_by.push(req.user._id);

    if (jobId.listing_type === "automated_listing") {
      const locum = await User.findById(req.user._id);
      results = [];
      jobId.preferences.map((item) => {
        if (locum.preferences.includes(item)) results.push(true);
      });

      if (results.includes(false)) updatedData.assigned_to.push(req.user._id);
    }

    try {
      let receiver = [];
      const isAdminExist = await Clinic.findById(jobId.clinic);
      receiver = isAdminExist?.user_id ?? [];

      const isOtherAdminExist = await ClinicGroup.findById(isAdminExist.group);
      isOtherAdminExist?.user_id?.map(async (userId) => {
        receiver.push(userId);

        const uniqueReceiver = [...new Set(receiver.map((item) => item))];

        if (uniqueReceiver.length > 0) {
          const sendingChats = uniqueReceiver.map(async (userId) => {
            const conversation = await createConversation(req.user._id, userId);

            let type = "";
            let text = "";

            if (jobId.listing_type === "automated_listing") {
              type = "badge";
              text = `has been approved the booking.`;
            } else if (jobId.listing_type === "manual_listing") {
              type = "locumCard";
              text = "Hi! I have booked this slot.";
            }

            const chatMessage = {
              type: type,
              text: text,
              conversation_id: conversation._id,
              sender: req.user._id,
              card: {
                title: jobId.clinic.clinicName,
                subtitle: "locum " + jobId.profession,
                date: DateTime.fromMillis(jobId.work_time_start)
                  .setZone("Asia/Singapore")
                  .toFormat("cccc, dd MMMM yyyy"),
                work_time_start: DateTime.fromMillis(jobId.work_time_start)
                  .setZone("Asia/Singapore")
                  .toLocaleString(DateTime.TIME_SIMPLE),
                work_time_finish: DateTime.fromMillis(jobId.work_time_finish)
                  .setZone("Asia/Singapore")
                  .toLocaleString(DateTime.TIME_SIMPLE),
              },
            };

            console.log(chatMessage);

            await sendMessage(chatMessage);
          });
        }
      });

      const bookedJob = await Job.updateOne(
        { _id: req.params.id },
        { $set: updatedData }
      );

      res.json(bookedJob);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.json("You have already booked this job.");
  }
};

const deleteBooking = async (req, res) => {
  const jobId = await Job.findById(req.params.id);

  if (!jobId) return res.status(404).json({ message: "The job is not found." });

  let hasUserBooked = jobId.booked_by.includes(req.user._id);

  if (hasUserBooked) {
    let updatedData = jobId;

    const book = updatedData.booked_by.filter((user) => {
      user !== req.body.user_id;
    });

    const assigned = updatedData.assigned_to.filter((user) => {
      user !== req.body.user_id;
    });

    updatedData.booked_by = book;
    updatedData.assigned_to = assigned;

    const calendar = await Calendar.findOne({
      job_id: jobId._id,
    });

    if (calendar) await Calendar.deleteOne({ _id: calendar._id });

    if (calendar?.google_calendar_id)
      await deleteEvent(calendar.google_calendar_id);

    try {
      const bookedJob = await Job.updateOne(
        { _id: req.params.id },
        { $set: updatedData }
      );
      res.json(bookedJob);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.json("You have already canceled booking this job.");
  }
};

const AssignTo = async (req, res) => {
  const user_id = ObjectId.isValid(req.body.user_id);
  if (!user_id) return res.status(400).json({ message: "user_id is invalid" });

  const job_id = ObjectId.isValid(req.params.id);
  if (!job_id) return res.status(400).json({ message: "job_id is invalid" });

  const jobId = await Job.findById(req.params.id);
  if (!jobId) return res.status(404).json({ message: "The job is not found." });

  const user = await User.findById(req.body.user_id);
  if (!user) return res.status(404).json({ message: "User is not found" });

  const hasAppointment = await Job.findOne({
    assigned_to: { $in: [req.body.user_id] },
    work_time_start: {
      $gte: jobId.work_time_start,
      $lt: jobId.work_time_finish,
    },
  });

  if (hasAppointment)
    return res.status(400).json({
      message:
        "The person you aprroved already has an appointment. Please choose another one.",
    });

  let assignmentAmount = jobId.assigned_to?.length;

  if (assignmentAmount < 1) {
    let hasAssignment = jobId.assigned_to.includes(req.body.user_id);

    if (!hasAssignment) {
      let updatedData = jobId;

      updatedData.assigned_to.push(req.body.user_id);

      try {
        const data = {};
        const clinic = await Clinic.findById(jobId.clinic);

        data.user_id = req.body.user_id;
        data.job_id = jobId._id;
        data.clinic_id = jobId.clinic;
        data.start = jobId.work_time_start;
        data.finish = jobId.work_time_finish;
        data.event = "Appointment at " + clinic.clinicName;

        const summary = data.event;
        const location = clinic.clinicAddress;
        const description = "You have appointmen at " + clinic.clinicName;
        const eventStartTime = DateTime.fromMillis(
          jobId.work_time_start
        ).toISO();
        const eventEndTime = DateTime.fromMillis(
          jobId.work_time_finish
        ).toISO();

        const subject = `Your slot has been confirmed for ${DateTime.fromMillis(
          jobId.work_time_start
        )
          .setZone("Asia/Singapore")
          .toFormat("dd LLLL yyyy")}`;

        const emailBody = `Your slot has been confirmed!
        Clinic: ${clinic.clinicName}
        Address:${clinic.clinicAddress}
        Date: ${DateTime.fromMillis(jobId.work_time_start)
          .setZone("Asia/Singapore")
          .toFormat("dd LLLL yyyy")}
        Time: ${DateTime.fromMillis(jobId.work_time_start)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE)}
        Thank you!`;

        const emails = [];
        const userEmail = jobId.assigned_to.map(async (e) => {
          const user = await User.findById(e);
          sendingEmail(user.email, subject, emailBody, null);
          emails.push(user.email);
        });
        await Promise.all(userEmail);

        const conversation = await createConversation(
          req.user._id,
          req.body.user_id
        );

        const chatMessage = {
          type: "badge",
          text: clinic.clinicName + " Approved the booking",
          conversation_id: conversation._id,
          sender: req.user._id,
        };

        await sendMessage(chatMessage);

        const assignment = await Job.updateOne(
          { _id: req.params.id },
          { $set: updatedData }
        );

        const googleCalendar = await createEvent(
          summary,
          location,
          description,
          eventStartTime,
          eventEndTime,
          emails,
          data
        );

        // await saveEvent(data);

        res.json(assignment);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json("You have booked this job.");
    }
  } else {
    res.status(400).json("The job has been assigned.");
  }
};

const rejectBooking = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();

    const newBookedBy = job.booked_by.filter((item) => {
      return item !== req.body.user_id;
    });

    const rejected = job.rejected;
    rejected.push(req.body.user_id);

    await Job.updateOne(
      { _id: req.params.jobId },
      { $set: { booked_by: newBookedBy, rejected: rejected } }
    )
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeRejected = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();

    booked_by = job.booked_by;
    booked_by.push(req.body.user_id);

    const newRejected = job.rejected.filter((item) => {
      return item !== req.body.user_id;
    });

    await Job.updateOne(
      { _id: req.params.jobId },
      { $set: { booked_by: booked_by, rejected: newRejected } }
    )
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upcomingBookingsByUserId = async (req, res) => {
  const today = moment().startOf("day");
  try {
    await Job.find({
      booked_by: { $in: [req.params.userId] },
      canceled_by: { $size: 0 },
      completed: false,
      date: { $gte: today.toDate() },
    })
      .sort({ date: 1 })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);
        res.json(output);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const upcomingUnassignmentByUserId = async (req, res) => {
  const today = moment().startOf("day");
  try {
    await Job.find({
      booked_by: { $in: [req.params.userId] },
      assigned_to: { $nin: [req.params.userId] },
      date: { $gte: today.toDate() },
      completed: false,
    })
      .sort({ date: 1 })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);

        res.json(output);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const upcomingAssignmentsByUserId = async (req, res) => {
  const today = moment().startOf("day");
  try {
    const jobs = await Job.find({
      assigned_to: { $in: [req.params.userId] },
      canceled_by: { $size: 0 },
      completed: false,
      date: { $gte: today.toDate() },
    })
      .sort({ date: 1 })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);

        res.json(output);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const countUpcomingAssignmentsByUserId = async (req, res) => {
  const today = moment().startOf("day");
  try {
    const count = await Job.find({
      assigned_to: { $in: [req.params.userId] },
      completed: false,
      date: { $gte: today.toDate() },
    }).count();

    res.json(count);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completedJobsByUser = async (req, res) => {
  try {
    await Job.find({
      assigned_to: { $in: [req.params.userId] },
      completed: true,
    })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);

        res.json(output);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const canceledJobsByUser = async (req, res) => {
  try {
    await Job.find({
      booked_by: { $in: [req.params.userId] },
      canceled_by: { $exists: true, $not: { $size: 0 } },
    })
      .lean()
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);

        res.json(output);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const countCompletedJobsByUser = async (req, res) => {
  try {
    const jobs = await Job.find({
      assigned_to: { $in: [req.params.userId] },
      completed: true,
    }).count();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upcomingBookingByClinic = async (req, res) => {
  try {
    const jobs = await Job.find({
      assigned_to: { $in: [req.params.userId] },
      completed: true,
    })
      .populate({
        path: "clinic",
        select: "clinicName clinicAddress",
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

        const output = formatData(data);

        res.json(output);
      });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const pastBookingByClinic = async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 100;
  const offset = limit * page;

  try {
    const now = DateTime.now().toMillis();

    const totalRows = await Job.find({
      clinic: req.query.clinic_id,
      work_time_start: { $gte: now },
      assigned_to: { $ne: [] },
    }).count();

    const totalPage = Math.ceil(totalRows / limit);

    const jobs = await Job.find({
      clinic: req.query.clinic_id,
      work_time_start: { $gte: now },
      assigned_to: { $ne: [] },
    })
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
    res.status(500).json({ message: error.message });
  }
};

const sendInterviewRequest = async (req, res) => {
  try {
    const conversation = await createConversation(req.user._id, req.body.to);
    const jobId = await Job.findById(req.body.jobId);

    if (!jobId)
      return res.status(404).json({ message: "The listing can not be found." });

    const chatMessage = {
      type: "locumCard",
      text: "Hi! I want to schedule for a work appointment.",
      conversation_id: conversation._id,
      sender: req.user._id,
      card: {
        title: jobId.clinic.clinicName,
        subtitle: "locum " + jobId.profession,
        date: DateTime.fromMillis(jobId.work_time_start)
          .setZone("Asia/Singapore")
          .toFormat("cccc, dd MMMM yyyy"),
        work_time_start: DateTime.fromMillis(jobId.work_time_start)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE),
        work_time_finish: DateTime.fromMillis(jobId.work_time_finish)
          .setZone("Asia/Singapore")
          .toLocaleString(DateTime.TIME_SIMPLE),
      },
    };

    await sendMessage(chatMessage);
    res.json({ message: "The interview request has been sent." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const upcomingBookingsBymonth = async (req, res) => {};

const completedBookingsByMonth = async (req, res) => {};

module.exports = {
  createBooking,
  deleteBooking,
  pastBookingByClinic,
  upcomingBookingsByUserId,
  upcomingAssignmentsByUserId,
  countUpcomingAssignmentsByUserId,
  upcomingUnassignmentByUserId,
  countCompletedJobsByUser,
  upcomingBookingByClinic,
  sendInterviewRequest,
  completedJobsByUser,
  canceledJobsByUser,
  removeRejected,
  rejectBooking,
  AssignTo,
};
