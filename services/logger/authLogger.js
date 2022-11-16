const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const authLogger = createLogger({
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_DB_ATLAS,
            collection: "authorization",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "authorization",
            level: "error",
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            db: process.env.MONGO_DB_ATLAS,
            collection: "authorization",
            level: "warning",
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = { authLogger };
