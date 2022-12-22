const Calendar = require("../models/Calendar");
const { DateTime } = require("luxon");

const getEvents = async (req, res) => {
  try {
    const data = await Calendar.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventByUserId = async (req, res) => {
  try {
    const events = await Calendar.find({ user_id: req.params.userId })
      .lean()
      .sort({ start: 1 })
      .select({ user_id: 0, clinic_id: 0, job_id: 0 })
      .then(async (data) => {
        data.map((item) => {
          item.date = DateTime.fromMillis(item.start)
            .setZone("Asia/Singapore")
            .toFormat("dd LLLL yyyy");
          item.start = DateTime.fromMillis(item.start)
            .setZone("Asia/Singapore")
            .toLocaleString(DateTime.TIME_SIMPLE);
          item.finish = DateTime.fromMillis(item.finish)
            .setZone("Asia/Singapore")
            .toLocaleString(DateTime.TIME_SIMPLE);
          return item;
        });

        const events = [];

        for (i = 0; i < 16; i++) {
          const item = {};
          const date = DateTime.now().plus({ days: i });
          item.date = date.toFormat("dd LLL");
          item.event = "";
          item.start = "";
          item.finish = "";
          item.type = "";
          item.link = "";

          if (i == 0) {
            item.currentDate = "true";
          } else {
            item.currentDate = "false";
          }

          const cal = await Calendar.find({
            user_id: req.params.userId,
            start: {
              $gte: date.startOf("day").toMillis(),
              $lte: date.endOf("day").toMillis(),
            },
          })
            .sort({ start: 1 })
            .lean()
            .then((el) => {
              el.map((j) => {
                item.event = j.event ?? "";
                item.start =
                  DateTime.fromMillis(j.start)
                    .setZone("Asia/Singapore")
                    .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
                item.finish =
                  DateTime.fromMillis(j.finish)
                    .setZone("Asia/Singapore")
                    .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
                item.type = j.type ?? "";
              });
            });

          events.push(item);
        }
        res.json(events);
      });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getEventsByClinicByMonth = async (req, res) => {
  try {
    const monthQuery = parseInt(req.query.month);
    const yearQuery = parseInt(req.query.year);
    let filters = {
      clinic_id: req.query.clinicId,
    };
    const getevents = await events(filters, monthQuery, yearQuery);

    res.json(getevents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventsByUserByMonth = async (req, res) => {
  try {
    const userId = req.query.user_id;
    const monthQuery = parseInt(req.query.month);
    const yearQuery = parseInt(req.query.year);
    let filters = {
      $or: [{ user_id: userId }, { attendees: { $in: [userId] } }],
    };
    const getevents = await events(filters, monthQuery, yearQuery);

    res.json(getevents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const events = async (filters, monthQuery, yearQuery) => {
  const now = DateTime.now().setZone("Asia/Singapore");
  let month = monthQuery || now.month;
  let year = yearQuery || now.year;

  const date = DateTime.utc(year, month, 15).setZone("Asia/Singapore");
  const start = date.startOf("month").toMillis();
  const end = date.endOf("month").toMillis();

  filters.start = { $gte: start, $lte: end };

  const calendar = await Calendar.find({
    start: { $gte: start, $lte: end },
    ...filters,
  })
    .select({
      start: 1,
      finish: 1,
      type: 1,
      event: 1,
      link: 1,
      job_id: 1,
      attendees: 1,
    })
    .lean();

  const dates = [];

  for (i = start; i < end; ) {
    const date = DateTime.fromMillis(i)
      .setZone("Asia/Singapore")
      .toFormat("dd LLL");
    const events = [];
    calendar.map(async (cal) => {
      if (cal.start >= i && cal.start <= i + 86400000) {
        if (
          cal.start > now.startOf("day").toMillis() &&
          cal.start < now.endOf("day")
        ) {
          cal.currentDate = true;
        } else {
          cal.currentDate = false;
        }

        cal.start =
          DateTime.fromMillis(cal.start)
            .setZone("Asia/Singapore")
            .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
        cal.finish =
          DateTime.fromMillis(cal.finish)
            .setZone("Asia/Singapore")
            .toLocaleString(DateTime.TIME_SIMPLE) ?? "";
        cal.type = cal.type ?? "";
        cal.link = cal.link ?? "";
        cal.attendees = cal.attendees ?? [];

        events.push(cal);
      }
    });
    dates.push({ date: date, events: events });
    i = i + 86400000;
  }

  return dates;
};

const get3DaysEventByUserId = async (req, res) => {
  const data = [];

  for (i = 0; i < 3; i++) {
    const item = {};
    const date = DateTime.now().plus({ days: i });
    item.date = date.toFormat("dd LLL");
    item.event = "No Slot";

    const cal = await Calendar.find({
      user_id: req.params.userId,
      start: {
        $gte: date.startOf("day").toMillis(),
        $lte: date.endOf("day").toMillis(),
      },
    })
      .sort({ start: 1 })
      .lean()
      .then((el) => {
        el.map((j) => {
          item.event = j.event;
        });
      });

    data.push(item);
  }

  return res.json(data);
};

const getEventById = async (req, res) => {
  try {
    const clinic = await Calendar.findById(req.params.id);
    res.json(clinic);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const saveEventByAPI = async (req, res) => {
  const calendar = new Calendar(req.body);
  try {
    const savedEvent = await calendar.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const saveEvent = async (data) => {
  const calendar = new Calendar(data);
  try {
    const savedEvent = await calendar.save();
    console.log("sukses");
  } catch (error) {}
};

const deleteEvent = async (req, res) => {
  const cekId = await Calendar.findById(req.params.id);
  if (!cekId)
    return res.status(404).json({
      message: "The data with id " + req.params.id + "is not found",
    });
  try {
    const deletedCalendar = await Calendar.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json(deletedCalendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getEventsByUserByMonth,
  get3DaysEventByUserId,
  getEventsByClinicByMonth,
  getEvents,
  getEventById,
  getEventByUserId,
  saveEventByAPI,
  saveEvent,
};
