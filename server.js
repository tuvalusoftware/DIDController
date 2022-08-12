import { createRequire } from "module";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import swaggerUiExpress from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

import router from "./routers/index.js";
import Logger from "./logger.js";
import SchemaValidator from "./schema/schemaValidator.js";
import { ERROR_CODES } from "./constants/index.js";

const require = createRequire(import.meta.url);
const services = require("./docs/swagger.json");

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

// Route
router(app);

// Handle global err
app.use((err, req, res, _) => {
    Logger.apiError(err, req, res);

    // Invalid JSON in body - body-parser
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(200).json(ERROR_CODES.INVALID_JSON_BODY);
    }

    if (SchemaValidator.validate(err, "ERROR_OBJECT")) {
        return res.status(200).json(err);
    }

    return res.status(200).json(ERROR_CODES.UNKNOWN_ERROR);
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
    Logger.info(`Server is live on port ${port}`);
});

export default app;
