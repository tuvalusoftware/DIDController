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
    let returnError;
    switch (err.errorCode) {
        case 1203:
            returnError = ERROR_CODES.FILE_EXISTED;
            break;
        case 1204:
            returnError = ERROR_CODES.FILE_NOT_FOUND;
            break;
        case 1207:
            returnError = ERROR_CODES.COMPANY_NOT_FOUND;
            break;
        default:
            returnError = err;
    }

    logger.apiError(err, req, res);
    res.status(200).json(returnError);
});

app.use("/api-docs", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(services)(...args)
);

const port = process.env.NODE_ENV !== "test" ? 9000 : 9001;
app.listen(port, (_) => {
    Logger.info(`Server is live on port ${port}`);
});

export default app;
