const Job = require("../models/Job.js");
const moment = require("moment");
const { DateTime, Duration } = require("luxon");
const { saveEvent } = require("./calendarController.js");
const Clinic = require("../models/Clinic.js");
const { statusJob, formatData } = require("./jobController");
const { createEvent } = require("../services/googleCalendar/index");
const User = require("../models/User.js");
const { restart } = require("nodemon");
const ObjectId = require("mongoose/lib/types/objectid.js");
const { sendingEmail } = require("../services/sendingEmail");
const { jobLogger } = require("../services/logger/jobLogger");
const ClinicGroup = require("../models/ClinicGroup");

const {
  createConversation,
  sendMessage,
} = require("../services/sendingChat/index.js");

const createBooking = async (req, res) => {
  const jobId = await Job.findById(req.params.id).populate({
    path: "clinic",
    select: "clinicName Address",
  });

  if (!jobId)
    return res.status(404).json({ message: "The listing is not found." });

  let hasUserBooked = jobId.booked_by.includes(req.user._id);

  if (!hasUserBooked) {
    let updatedData = jobId;

    updatedData.booked_by.push(req.user._id);

    try {
      let receiver = [];
      const isAdminExist = await Clinic.findById(jobId.clinic);
      receiver = isAdminExist?.user_id ?? [];

      const isOtherAdminExist = await ClinicGroup.findById(isAdminExist.group);
      isOtherAdminExist?.user_id?.map(async (userId) => {
        receiver.push(userId);

        if (receiver.length > 0) {
          const sendingChats = receiver.map(async (userId) => {
            const conversation = await createConversation(req.user._id, userId);

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
          });

          await Promise.all(sendingChats);
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

    updatedData.booked_by.pop(req.user._id);

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
  // if(req.user.status !== "verified")

  const jobId = await Job.findById(req.params.id);
  if (!jobId) return res.status(404).json({ message: "The job is not found." });

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
        const location = clinic.Address;
        const description = "You have appointmen at " + clinic.clinicName;
        const eventStartTime = DateTime.fromMillis(
          jobId.work_time_start
        ).toISO();
        const eventEndTime = DateTime.fromMillis(
          jobId.work_time_finish
        ).toISO();

        const emails = [];
        const userEmail = jobId.assigned_to.map(async (e) => {
          const user = await User.findById(e);
          sendingEmail(user.email, summary, description, null);
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

        console.log(chatMessage);

        await sendMessage(chatMessage);

        const assignment = await Job.updateOne(
          { _id: req.params.id },
          { $set: updatedData }
        );

        await saveEvent(data);
        createEvent(
          summary,
          location,
          description,
          eventStartTime,
          eventEndTime,
          emails
        );
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
        favorites: 1,
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
        favorites: 1,
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
        favorites: 1,
      })
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
        favorites: 1,
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
        favorites: 1,
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
        favorites: 1,
      })
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
  upcomingBookingByClinic,
  countCompletedJobsByUser,
  completedJobsByUser,
  canceledJobsByUser,
  rejectBooking,
  AssignTo,
};
