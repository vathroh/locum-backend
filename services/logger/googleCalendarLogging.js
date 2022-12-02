const { createLogger, transports, format } = require("winston");

const googleCalendarLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/googlecalendar.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/googlecalendar.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/googlecalendar.log",
      level: "warning",
    }),
  ],
});

module.exports = { googleCalendarLogger };
