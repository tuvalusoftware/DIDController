import { createRequire } from "module";
import express from "express";
import bodyParser from "body-parser";
import swaggerUiExpress from "swagger-ui-express";
import cors from "cors";

import router from "./routers/index.js";
import Logger from "./logger.js";
import { ERROR_CODES } from "./constants/index.js";
import logger from "./logger.js";

const require = createRequire(import.meta.url);
const services = require("./swagger/did_controller.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

// Route
router(app);

// Handle global err
app.use((err, req, res, _) => {
    // Convert github errors to human readable errors
    let returnError;
    switch (err) {
        case ERROR_CODES.BLOB_EXISTED:
            returnError = ERROR_CODES.FILE_EXISTED;
            break;
        case ERROR_CODES.BLOB_NOT_EXISTED:
            returnError = ERROR_CODES.FILE_NOT_FOUND;
            break;
        case ERROR_CODES.BRANCH_NOT_EXISTED:
            returnError = ERROR_CODES.COMPANY_NOT_FOUND;
            break;
        default:
            returnError = err;
    }

    logger.apiError(err, req, res);
    res.status(200).json(returnError);
});

/* c8 ignore start */
app.use("/api-docs", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(services)(...args)
);
/* c8 ignore stop */

const port = process.env.NODE_ENV !== "test" ? 9000 : 9001;
app.listen(port, (_) => {
    Logger.info(`Server is live on port ${port}`);
});

export default app;
