const { createLogger, transports, format } = require("winston");

const conversationLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/conversation.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/conversation.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/conversation.log",
      level: "warning",
    }),
  ],
});

module.exports = { conversationLogger };
