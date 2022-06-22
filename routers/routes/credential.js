import express from "express";
import credentialController from "../controllers/credential.js";

const router = express.Router();

router
    .route("/")
    .get(credentialController.getCredentialsByPublicKey)
    .post(credentialController.saveCredential);

export default router;
