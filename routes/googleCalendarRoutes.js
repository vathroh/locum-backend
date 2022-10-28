const router = require("express").Router();
const { getEvent, createEvent } = require("../services/googleCalendar/index");
const { google } = require("googleapis");
const { DateTime } = require("luxon");
const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
    "883040963244-gvl6le1kh4bonfkm0qss5o08q1ffcp6r.apps.googleusercontent.com",
    "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"
);

oAuth2Client.setCredentials({
    refresh_token:
        "1//04HyTVscXB13TCgYIARAAGAQSNwF-L9IrYoOm5H-LtV26PSFAgW8VmhO7O6qjz2pCC8T5REYAiePga6HSiV6nQ0hLMvWfrdzZb1E",
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

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

module.exports = router;
