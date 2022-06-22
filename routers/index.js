import didRoute from "./routes/did.js";
import docRoute from "./routes/doc.js";
import credentialRoute from "./routes/credential.js";

export default (app) => {
    app.use("/api/did", didRoute);
    app.use("/api/doc", docRoute);
    app.use("/api/credential", credentialRoute);
};
