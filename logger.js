/* c8 ignore start */
import { createLogger, format, transports } from "winston";
import { detectGithubError } from "./db/github/helpers.js";
import SchemaValidator from "./schema/schemaValidator.js";
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
        infoLogger.error(
            `[${req.method} - ${req.originalUrl}] ${err.error_message}`
        );
        debugLogger.error(
            `[${req.method} - ${req.originalUrl}] ${err.error_message}`
        );
    },
    handleGithubError(err) {
        // If error is already identified as the custom error, return it.
        if (SchemaValidator.validate(err, "ERROR_OBJECT")) {
            return err;
        }

        // Handle error returned by Github
        if (err.response) {
            const detectedErr = detectGithubError(err);

            if (detectedErr === ERROR_CODES.GITHUB_API_ERROR) {
                infoLogger.error(
                    `Uncaught when call Github API error: Status: ${err.response.status}, Error message: ${err.response.data.message}`
                );
                debugLogger.error(
                    `Uncaught when call Github API error: Status: ${err.response.status}, Error message: ${err.response.data.message}`
                );
            }

            return detectedErr;
        }
        // Array of errors return by Github GraphQL API
        else if (Array.isArray(err)) {
            return detectGithubError(err);
        }
        // Other unexpected errors
        else {
            infoLogger.error(`Uncaught error: ${JSON.stringify(err)}`);
            debugLogger.error(`Uncaught error: ${JSON.stringify(err)}`);
            return ERROR_CODES.UNKNOWN_ERROR;
        }
    },
};
/* c8 ignore stop */
