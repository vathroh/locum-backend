const { createLogger, transports, format } = require("winston");

const chatLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/chat.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/chat.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/chat.log",
      level: "warning",
    }),
  ],
});

module.exports = { chatLogger };
