import { Request } from "express";
import winston from "winston";

import env from "../constants/env";
import { AppError } from "../errors/AppError";
import { stringifyError } from "../errors/errorHandlers";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const isDevelopment = env.NODE_ENV !== "production";
    return isDevelopment ? "debug" : "warn";
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
        (info) => `[${info.timestamp} - ${info.level}]: ${info.message}`
    )
);

const transports =
    env.NODE_ENV !== "test"
        ? [
              new winston.transports.Console({
                  format: winston.format.colorize({ all: true }),
              }),
              new winston.transports.File({
                  filename: "./logs/error.log",
                  level: "error",
              }),
              new winston.transports.File({ filename: "./logs/all.log" }),
          ]
        : [
              new winston.transports.File({
                  filename: "./logs/error-test.log",
                  level: "error",
              }),
              new winston.transports.File({ filename: "./logs/all-test.log" }),
          ];

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

const Logger = {
    http: (message: string) => {
        logger.http(message);
    },
    error: (error: string | Error | AppError) => {
        if (error instanceof String) logger.error(error);
        else logger.error(stringifyError(error));
    },
    info: (message: string) => {
        logger.info(message);
    },
    warn: (message: string) => {
        logger.warn(message);
    },
    // Custom logging
    apiInfo: (req: Request, message: string) => {
        logger.info(`${req.method} ${req.originalUrl}: ${message}`);
    },
    apiError: (req: Request, error: Error | AppError) => {
        let errorMessage: string = "";
        if (error instanceof AppError) {
            errorMessage = `${error} - ${error.error_message} ${
                error.error_detail ? "- " + error.error_detail : ""
            }`;
        } else {
            errorMessage = stringifyError(error);
        }

        logger.error(`${req.method} ${req.originalUrl}: ${errorMessage}`);
    },
};

export default Logger;
