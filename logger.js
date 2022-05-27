import { createLogger, format, transports } from "winston";
import { ERROR_CODES } from "./constants/index.js";

const customLogLevel = (logLevel) => {
    return {
        error: "⛔️ ERROR",
        warn: "⚠️ WARN",
        info: "🆕 INFO",
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
    apiError(err, req, res) {
        logger.error(`[${req.method} - ${req.originalUrl}] ${err.message}`);
    },
    handleGithubError(err) {
        if (err.response) {
            if (
                err.response.status === 401 &&
                err.response.data.message === "Bad credentials"
            ) {
                return ERROR_CODES.BAD_CREDENTIALS;
            }

            logger.error(
                `Uncaught when call Github API error: Status: ${err.response.status}, Error message: ${err.response.data.message}`
            );
            return ERROR_CODES.GITHUB_API_ERROR;
        } else {
            logger.error(`Uncaught error: ${err.message}`);
            return ERROR_CODES.UNKNOWN_ERROR;
        }
    },
};
