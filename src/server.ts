import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import methodOverride from "method-override";

import env from "./constants/env";
import Logger from "./libs/Logger";
import connectMongo from "./libs/connectMongo";
import { handleError } from "./middlewares/handleError";
import morganMiddleware from "./middlewares/morganLogger";
import setUpSwagger from "./middlewares/setUpSwagger";
import routersHandler from "./routers";

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
setUpSwagger(app);

// Logging for each endpoint
app.use(morganMiddleware);

// ** Health Check Endpoint
app.get("/api/health-check", (req: Request, res: Response) => {
    return res.status(200).json({
        name: "DID Controller",
        version: "v2.0.0",
    });
});

// ** Routers
routersHandler(app);

// ** Handle global err
app.use(handleError);

const port = env.NODE_ENV !== "test" ? env.SERVER_PORT : 9001;
app.listen(port, () => {
    Logger.info(`Environment: ${env.NODE_ENV}`);
    Logger.info(`Server is live: http://localhost:${port}`);
});

export default app;
