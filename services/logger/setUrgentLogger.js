const { createLogger, transports, format } = require("winston");

const setUrgentLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/seturgentjob.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/seturgentjob.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/seturgentjob.log",
      level: "warning",
    }),
  ],
});

module.exports = { setUrgentLogger };
