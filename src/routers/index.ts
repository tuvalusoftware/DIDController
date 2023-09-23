import { Express } from "express";

import didRoute from "./routes/did.route";

export default (app: Express) => {
    app.use("/api/did", didRoute);
};
