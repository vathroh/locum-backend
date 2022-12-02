const { createLogger, transports, format } = require("winston");

const userLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/user.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/user.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/user.log",
      level: "warning",
    }),
  ],
});

module.exports = { userLogger };
