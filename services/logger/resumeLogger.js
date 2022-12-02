const { createLogger, transports, format } = require("winston");

const resumeLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/resume.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/resume.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/resume.log",
      level: "warning",
    }),
  ],
});

module.exports = { resumeLogger };
