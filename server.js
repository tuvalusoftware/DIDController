import { createRequire } from "module";
import express from "express";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import cors from "cors";

import didRouter from "./routes/did.js";
import docRouter from "./routes/doc.js";
import cardanoRouter from "./routes/cardano.js";

const require = createRequire(import.meta.url);
const cardanoServices = require("./swagger/cardano.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

// Route
app.use(didRouter);
app.use(docRouter);
app.use(cardanoRouter);

// Swagger config
const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Github Proxy API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:8080",
                description: "Github Database server",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const githubProxySwaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(githubProxySwaggerSpec)(...args)
);

app.use("/api-cardano", swaggerUiExpress.serve, (...args) =>
    swaggerUiExpress.setup(cardanoServices)(...args)
);

const port = 8080;
app.listen(port, (req, res) => {
    console.log(`Server is live on ${port}`);
});
