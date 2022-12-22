const { createLogger, transports, format } = require("winston");

const vaccinationLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/vaccination.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/vaccination.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/vaccination.log",
      level: "warning",
    }),
  ],
});

module.exports = { vaccinationLogger };
