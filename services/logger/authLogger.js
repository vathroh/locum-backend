const { createLogger, transports, format } = require("winston");

const authLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/authorization.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/authorization.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/authorization.log",
      level: "warning",
    }),
  ],
});

module.exports = { authLogger };
