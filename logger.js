import { createLogger, format, transports } from "winston";

const customLogLevel = (logLevel) => {
    return {
        error: "⛔️ ERROR",
        warn: "⚠️ WARN",
        info: "ℹ️ INFO",
    }[logLevel];
};

const logConfiguration = {
    transports: [
        new transports.Console({
            format: format.combine(format.colorize({ all: true })),
        }),
        new transports.File({
            filename: "logs/server.log",
        }),
    ],
    format: format.combine(
        format.timestamp({
            format: "MMM-DD-YYYY HH:mm:ss",
        }),
        format.align(),
        format.printf(
            (info) =>
                `[${customLogLevel(info.level)}]: [${[info.timestamp]}]: ${
                    info.message
                }\n`
        )
    ),
};

const logger = createLogger(logConfiguration);

export default {
    info(message) {
        logger.info(message);
    },
    apiInfo(req, res, message) {
        logger.info(`[${req.method} - ${req.originalUrl}] ${message}`);
    },
};
