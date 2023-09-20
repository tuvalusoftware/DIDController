import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import methodOverride from "method-override";
import swaggerUiExpress from "swagger-ui-express";

import env from "./constants/env";
import { AppError } from "./errors/AppError";
import { ERROR_CODES } from "./errors/errorCodes";
import Logger from "./libs/Logger";
import connectMongo from "./libs/connectMongo";
import morganMiddleware from "./routers/middlewares/morganLogger";
import swaggerSchema from "./schemas/swagger.schema";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(
    bodyParser.urlencoded({
        limit: "200mb",
        extended: true,
        parameterLimit: 1000000,
    })
);
app.use(methodOverride());

// ** Connect to Mongo DB
connectMongo();

// Swagger
/* c8 ignore start */
app.use(
    "/api-docs",
    swaggerUiExpress.serve,
    swaggerUiExpress.setup(swaggerSchema, {
        customSiteTitle: "DID Controller",
    })
);
/* c8 ignore stop */

// Logging for each endpoint
app.use(morganMiddleware);

// ** Health Check Endpoint
app.get("/api/health-check", (req: Request, res: Response) => {
    return res.status(200).json({
        name: "DID Controller",
        version: "v2.0.0",
    });
});

// Handle global err
app.use((err: any, req: Request, res: Response, _: NextFunction) => {
    /* c8 ignore start */
    try {
        if (err instanceof AppError) {
            throw err;
        }

        // Invalid JSON in body - body-parser
        if (err instanceof SyntaxError && "body" in err)
            throw new AppError(ERROR_CODES.INVALID_JSON_BODY);

        // Catch connection timeout and connection refuse error
        if (err.code === "ECONNABORTED")
            throw new AppError(ERROR_CODES.CONNECTION_TIMEOUT);
        if (err.code === "ECONNREFUSED")
            throw new AppError(ERROR_CODES.CONNECTION_REFUSED);

        Logger.error(err);
        throw new AppError(ERROR_CODES.UNKNOWN_ERROR);
    } catch (err: any) {
        Logger.apiError(req, err);
        return res.status(200).json((err as AppError).error);
    }
    /* c8 ignore stop */
});

const port = env.NODE_ENV !== "test" ? env.SERVER_PORT : 9001;
app.listen(port, () => {
    Logger.info(`Environment: ${env.NODE_ENV}`);
    Logger.info(`Server is live: http://localhost:${port}`);
});

export default app;
