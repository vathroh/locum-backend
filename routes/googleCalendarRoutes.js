const router = require("express").Router();
const { google } = require("googleapis");
const { DateTime } = require("luxon");
const { OAuth2 } = google.auth;

const {
  getEvent,
  createEvent,
  deleteEvent,
} = require("../services/googleCalendar/index");

const oAuth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

router.get("/get-event", (req, res) => {
  calendar.events.list(
    {
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: "2022-09-20T12:53:56.000Z",
      timeMax: "2022-12-26T12:53:56.000Z",
    },
    (err, data) => {
      // console.log(data.data.items);
      res.json(data.data.items);
    }
  );
});

router.get("/:eventId", (req, res) => {
  const summary = "Appointment at Buana Medic Center";
  const location = "Jl. Buana Raya No. 16 Semarang";
  const description = "You have appointmen at Buana Medic Center";
  const eventStartTime = DateTime.local(2022, 10, 31, 10).toISO();
  const eventEndTime = DateTime.local(2022, 11, 3, 17).toISO();
  const emails = ["vathroh@gmail.com"];

  createEvent(
    summary,
    location,
    description,
    eventStartTime,
    eventEndTime,
    emails
  );
  res.json("suksess");
  // calendar.events.get(
  //     {
  //         calendarId: "primary",
  //         eventId: "bv61v49slmu4fs7pkq9a3d28ho",
  //     },
  //     (err, data) => {
  //         if (err) res.status(500).json(err.message);
  //         res.json(data.data);
  //     }
  // );
});

router.post("/create-event", (req, res) => {
  const wer = createEvent();
  res.json(wer);
});

router.delete("/", (req, res) => {
  deleteEvent(req.body.google_calendar_id);
});

module.exports = router;
