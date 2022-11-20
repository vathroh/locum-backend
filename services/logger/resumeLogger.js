const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const resumeLogger = createLogger({
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_DB_ATLAS,
            collection: "resume",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "resume",
            level: "error",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "resume",
            level: "warning",
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = { resumeLogger };
