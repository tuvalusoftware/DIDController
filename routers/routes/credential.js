import express from "express";
import credentialController from "../controllers/credential.js";
import authController from "../controllers/auth.js";

const router = express.Router();

// router.use(authController.ensureSecurityServiceAuthentication);

router
    .route("/")
    .get(credentialController.getCredentialByHash)
    .post(credentialController.saveCredential);

export default router;
