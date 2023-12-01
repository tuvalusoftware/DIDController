import { Express } from "express";

import creRoute from "./routes/cre.route";
import didRoute from "./routes/did.route";
import didDocRoute from "./routes/doc.route";

export default (app: Express) => {
  app.use("/api/v2/did", didRoute);
  app.use("/api/v2/credential", creRoute);
  app.use("/api/v2/doc", didDocRoute);
};
