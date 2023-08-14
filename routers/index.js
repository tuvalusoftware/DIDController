import authRoute from "./routes/auth.js";
import credentialRoute from "./routes/credential.js";
import didRoute from "./routes/did.js";
import docRoute from "./routes/doc.js";
import gitRoute from "./routes/git.js";

export default (app) => {
    app.use("/api/auth", authRoute);
    app.use("/api/did", didRoute);
    app.use("/api/doc", docRoute);
    app.use("/api/credential", credentialRoute);
    app.use("/api/git", gitRoute);
};
