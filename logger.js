import { createLogger, format, transports } from "winston";
import { ERROR_CODES } from "./constants/index.js";

const customLogLevel = (logLevel) => {
    return {
        error: "⛔️ ERROR",
        warn: "⚠️ WARN",
        info: "🆕 INFO",
    }[logLevel];
};

// Formatting logging string
const formatConfig = format.combine(
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
);

// Info logger
let infoLogConfigs = {
    transports: [
        new transports.File({
            filename: "logs/server.log",
        }),
    ],
    format: formatConfig,
};
// Log to console if not test env
if (process.env.NODE_ENV !== "test") {
    infoLogConfigs.transports.push(
        new transports.Console({
            format: format.combine(format.colorize({ all: true })),
        })
    );
}

// Debugging/Error logger
const debugLogConfigs = {
    transports: [
        new transports.File({
            filename: "logs/debug.log",
        }),
    ],
    format: formatConfig,
};

const infoLogger = createLogger(infoLogConfigs);
const debugLogger = createLogger(debugLogConfigs);

export default {
    info(message) {
        infoLogger.info(message);
    },
    apiInfo(req, res, message) {
        infoLogger.info(`[${req.method} - ${req.originalUrl}] ${message}`);
    },
    apiError(err, req, res) {
        infoLogger.error(`[${req.method} - ${req.originalUrl}] ${err.message}`);
        debugLogger.error(
            `[${req.method} - ${req.originalUrl}] ${err.message}`
        );
    },
    handleGithubError(err) {
        if (err.response) {
            if (
                err.response.status === 401 &&
                err.response.data.message === "Bad credentials"
            ) {
                return ERROR_CODES.BAD_CREDENTIALS;
            }

            if (
                err.response.status === 409 &&
                err.response.data.message.includes("is at") &&
                err.response.data.message.includes("but expected")
            ) {
                return ERROR_CODES.CONFLICT_PUSH;
            }

            if (
                err.response?.status === 422 &&
                err.response?.data.message === "Reference already exists"
            ) {
                return ERROR_CODES.REF_EXISTED;
            }

            if (
                err.response?.status === 422 &&
                err.response?.data.message.includes("is not a valid name")
            ) {
                return ERROR_CODES.INVALID_REF_NAME;
            }

            infoLogger.error(
                `Uncaught when call Github API error: Status: ${err.response.status}, Error message: ${err.response.data.message}`
            );
            debugLogger.error(
                `Uncaught when call Github API error: Status: ${err.response.status}, Error message: ${err.response.data.message}`
            );
            return ERROR_CODES.GITHUB_API_ERROR;
        }
        // Array of errors return by Github GraphQL API
        else if (Array.isArray(err)) {
            const errors = err;
            errors.forEach((error) => {
                infoLogger.error(
                    `Uncaught when call Github API error: Error message: ${error.message}`
                );
                debugLogger.error(
                    `Uncaught when call Github API error: ${JSON.stringify(
                        error
                    )}`
                );
            });
            return ERROR_CODES.GITHUB_API_ERROR;
        }
        // Other unexpected errors
        else {
            infoLogger.error(`Uncaught error: ${JSON.stringify(err)}`);
            debugLogger.error(`Uncaught error: ${JSON.stringify(err)}`);
            return ERROR_CODES.UNKNOWN_ERROR;
        }
    },
};
