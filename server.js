import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import methodOverride from "method-override";
import { createRequire } from "module";
import swaggerUiExpress from "swagger-ui-express";
dotenv.config();

import { ERROR_CODES } from "./constants/index.js";
import Logger from "./logger.js";
import router from "./routers/index.js";
import SchemaValidator from "./schema/schemaValidator.js";

const require = createRequire(import.meta.url);
const services = require("./docs/swagger.json");

const app = express();

const corsOptions = {
    origin: [
        "http://18.139.84.180:11000",
        "https://paperless-fuixlabs.ap.ngrok.io",
        "https://tradetrust-fuixlabs.ap.ngrok.io",
        "http://localhost:4000",
    ],
    credentials: true,
};
app.use(cors(corsOptions));

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

// Route
router(app);

// Handle global err
app.use((err, req, res, _) => {
    Logger.apiError(err, req, res);

    /* c8 ignore start */
    // Invalid JSON in body - body-parser
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(200).json(ERROR_CODES.INVALID_JSON_BODY);
    }

    // Handle catch-able errors
    if (SchemaValidator.validate(err, "ERROR_OBJECT")) {
        return res.status(200).json(err);
    }

    // Catch connection timeout and connection refuse error
    if (err.code === "ECONNABORTED")
        return res.status(200).json(ERROR_CODES.CONNECTION_TIMEOUT);
    if (err.code === "ECONNREFUSED")
        return res.status(200).json(ERROR_CODES.CONNECTION_REFUSED);

    return res.status(200).json(ERROR_CODES.UNKNOWN_ERROR);
    /* c8 ignore stop */
});

/* c8 ignore start */
app.use("/api-docs", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(services, {
        customSiteTitle: "DID Controller",
    })(...args)
);
/* c8 ignore stop */

const port = process.env.NODE_ENV !== "test" ? 9000 : 9001;
app.listen(port, (_) => {
    Logger.info(`Server is live: http://localhost:${port}`);
});

export default app;
