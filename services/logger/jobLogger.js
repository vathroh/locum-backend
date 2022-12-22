const { createLogger, transports, format } = require("winston");

const jobLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/jobs.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/jobs.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/jobs.log",
      level: "warning",
    }),
  ],
});

module.exports = { jobLogger };
