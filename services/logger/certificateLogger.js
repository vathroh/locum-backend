const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const certificateLogger = createLogger({
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_DB_ATLAS,
            collection: "certificates",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "certificates",
            level: "error",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "certificates",
            level: "warning",
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = { certificateLogger };
