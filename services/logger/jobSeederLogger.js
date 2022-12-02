const { createLogger, transports, format } = require("winston");

const jobSeederLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/job-seeder.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/job-seeder.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/job-seeder.log",
      level: "warning",
    }),
  ],
});

module.exports = { jobSeederLogger };
