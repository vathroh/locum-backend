const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const achievementLogger = createLogger({
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_DB_ATLAS,
            collection: "achievement",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "achievement",
            level: "error",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "achievement",
            level: "warning",
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = { achievementLogger };
