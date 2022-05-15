import express from "express";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import didRouter from "./routes/did.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route
app.use(didRouter);

// Swagger config
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Github Proxy API",
        version: "1.0.0",
    },
    servers: [
        {
            url: "http://localhost:8080",
            description: "Development server",
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUiExpress.serve,
    swaggerUiExpress.setup(swaggerSpec)
);

const port = 8080;
app.listen(port, (req, res) => {
    console.log(`Server is live on ${port}`);
});
