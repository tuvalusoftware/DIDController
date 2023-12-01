import { Express } from "express";
import swaggerUiExpress from "swagger-ui-express";

import swaggerSchema from "../schemas/swagger.schema";

const setUpSwagger = (app: Express) => {
    /* c8 ignore start */
    app.use(
        "/api-docs",
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(swaggerSchema, {
            customSiteTitle: "DID Controller",
        })
    );
    /* c8 ignore stop */
};

export default setUpSwagger;
