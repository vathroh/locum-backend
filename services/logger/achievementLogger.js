const { createLogger, transports, format } = require("winston");

const achievementLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/achievement.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/achievement.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/achievement.log",
      level: "warning",
    }),
  ],
});

module.exports = { achievementLogger };
