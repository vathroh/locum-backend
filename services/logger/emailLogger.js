const { createLogger, transports, format } = require("winston");

const emailLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/sendemail.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/sendemail.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/sendemail.log",
      level: "warning",
    }),
  ],
});

module.exports = { emailLogger };
