import { createRequire } from "module";
import express from "express";
import bodyParser from "body-parser";
import swaggerUiExpress from "swagger-ui-express";
import cors from "cors";

import router from "./routers/index.js";

const require = createRequire(import.meta.url);
const services = require("./swagger/did_controller.json");
const cardanoServices = require("./swagger/cardano.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

// Route
router(app);

app.use("/api-docs", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(services)(...args)
);

app.use("/api-cardano", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(cardanoServices)(...args)
);

const port = 9000;
app.listen(port, (req, res) => {
    console.log(`Server is live on ${port}`);
});

export default app;
