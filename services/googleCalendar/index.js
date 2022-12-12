const { google } = require("googleapis");
const { DateTime } = require("luxon");
const { OAuth2 } = google.auth;
const { googleCalendarLogger } = require("../logger/googleCalendarLogging");

const oAuth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

const createEvent = (
  summary,
  location,
  description,
  eventStartTime,
  eventEndTime,
  emails
) => {
  const attendees = [];
  emails.map((e) => {
    attendees.push({ email: e });
  });
  const event = {
    summary: summary,
    location: location,
    description: description,
    colorId: 1,
    start: {
      dateTime: eventStartTime,
      timeZone: "Asia/Singapore",
    },
    end: {
      dateTime: eventEndTime,
      timeZone: "Asia/Singapore",
    },
    attendees: attendees,
  };

  try {
    calendar.events.insert(
      { calendarId: "primary", resource: event },
      (err, data) => {
        if (err) {
          googleCalendarLogger.error(
            `error: ${err}, data: ${JSON.stringify(event)}`
          );
          return {
            message: "Error Creating Calender Event:",
            err,
          };
        }

        console.log("google calendar event created");

        googleCalendarLogger.info(
          `success creating event: ${JSON.stringify(event)}`
        );

        return { message: "Calendar event successfully created." };
      }
    );
  } catch (error) {
    return error;
  }
};

const listEvents = () => {
  calendar.events.list(
    {
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: "2022-11-20T12:53:56.000Z",
      timeMax: "2022-12-26T12:53:56.000Z",
    },
    (err, data) => {
      // console.log(data.data.items);
    }
  );
};

const getEvent = (req, res) => {
  res.json("halo");
  calendar.events.get(
    {
      calendarId: "primary",
      eventId: "bv61v49slmu4fs7pkq9a3d28ho",
    },
    (err, data) => {
      if (err) res.status(500).json(err.message);
      // res.json(data.data);
    }
  );
  // res.json("halo");
};

const updateEvent = () => {
  calendar.events.get(
    {
      calendarId: "primary",
      eventId: "bv61v49slmu4fs7pkq9a3d28ho",
    },
    (err, data) => {
      let event = data.data;
      event.summary = "Appointment at Medicac Center";
      calendar.events.update({
        calendarId: "primary",
        eventId: "bv61v49slmu4fs7pkq9a3d28ho",
        resource: event,
      });
      // console.log(event);
    }
  );
  // getEvent();
};

const deleteEvent = async (id) => {
  let cb = {};
  const cal = await calendar.events.delete(
    {
      calendarId: "primary",
      eventId: id,
    },
    (err, data) => {
      if (err) {
        error = err;
      }
      cb = data;
    }
  );

  return cb;
};

const freeBusy = () => {
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: "Asia/Jakarta",
        items: [{ id: "primary" }],
      },
    },
    (err, res) => {
      if (err) return console.error("Free Busy Query Error: ", err);

      const eventArr = res.data.calendars.primary.busy;

      if (eventArr.length === 0)
        return calendar.events.insert(
          { calendarId: "primary", resource: event },
          (err) => {
            if (err)
              return console.error("Error Creating Calender Event:", err);
            return console.log("Calendar event successfully created.");
          }
        );

      return console.log(`Sorry I'm busy...`);
    }
  );
};

module.exports = { getEvent, createEvent, listEvents, deleteEvent };
