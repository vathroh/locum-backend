const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const authLogger = createLogger({
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_DB_ATLAS,
            collection: "auth",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "auth",
            level: "error",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "auth",
            level: "warning",
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = { authLogger };
