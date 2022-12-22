const { createLogger, transports, format } = require("winston");

const bookingLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "log/booking.log",
      level: "info",
    }),
    new transports.File({
      filename: "log/booking.log",
      level: "error",
    }),
    new transports.File({
      filename: "log/booking.log",
      level: "warning",
    }),
  ],
});

module.exports = { bookingLogger };
