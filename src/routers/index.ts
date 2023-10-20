import { Express } from "express";

import creRoute from "./routes/cre.route";
import didRoute from "./routes/did.route";
import didDocRoute from "./routes/doc.route";

export default (app: Express) => {
  app.use("/api/did", didRoute);
  app.use("/api/credential", creRoute);
  app.use("/api/doc", didDocRoute);
};
