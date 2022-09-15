/* c8 ignore start */
import { createLogger, format, transports } from "winston";
import { detectGithubError } from "./db/github/helpers.js";
import SchemaValidator from "./schema/schemaValidator.js";
import { ERROR_CODES } from "./constants/index.js";

const customLogLevel = (logLevel) => {
    return {
        error: "ERROR",
        warn: "WARN",
        info: "INFO",
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
            `[${customLogLevel(info.level)}] - [${[info.timestamp]}]: ${
                info.message
            }`
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
    functionInfo(fileInfo, functionInfo) {
        infoLogger.info(`[${fileInfo}] ${functionInfo}`);
    },
    apiInfo(req, res, message) {
        infoLogger.info(`[${req.method} - ${req.originalUrl}] ${message}`);
    },
    error(message) {
        infoLogger.error(message);
        debugLogger.error(message);
    },
    apiError(err, req, res) {
        const errorMsg =
            err instanceof Error
                ? `${err.message} - ${err.stack}`
                : err.error_message;

        infoLogger.error(`[${req.method} - ${req.originalUrl}] ${errorMsg}`);
        debugLogger.error(`[${req.method} - ${req.originalUrl}] ${errorMsg}`);
    },
    handleGithubError(err) {
        // If error is already identified as the default error, return it.
        if (SchemaValidator.validate(err, "ERROR_OBJECT")) {
            return err;
        }

        // Handle error returned by Github
        if (err.response) {
            const detectedErr = detectGithubError(err);

            // Handle unexpected Github errors
            if (detectedErr === ERROR_CODES.GITHUB_API_ERROR) {
                infoLogger.error(
                    `Unexpected error when call Github API error: Status: ${
                        err.response.status
                    }, Error message: ${
                        err.response.data.message
                    }, Other errors: ${JSON.stringify(
                        err.response.data.errors
                    )}, Stringify Errors: ${JSON.stringify(err.data)}`
                );
                debugLogger.error(
                    `Unexpected error when call Github API error: Status: ${
                        err.response.status
                    }, Error message: ${
                        err.response.data.message
                    }, Other errors: ${JSON.stringify(
                        err.response.data.errors
                    )}, Stringify Errors: ${JSON.stringify(err.data)}`
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
            infoLogger.error(`Unexpected error: ${JSON.stringify(err)}`);
            debugLogger.error(`Unexpected error: ${JSON.stringify(err)}`);
            return ERROR_CODES.UNKNOWN_ERROR;
        }
    },
};
/* c8 ignore stop */
