const { createLogger, transports, format } = require("winston");

const certificateLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/certificate.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/certificate.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/certificate.log",
      level: "warning",
    }),
  ],
});

module.exports = { certificateLogger };
