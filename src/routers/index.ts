import { Express } from "express";

import didController from "./controllers/did.controller";

export default (app: Express) => {
    app.post("/api/did/", didController.storeDID);
    app.get("/api/did/all", didController.getAllDIDs);
};
