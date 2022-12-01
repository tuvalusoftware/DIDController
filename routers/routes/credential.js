import express from "express";
import authController from "../controllers/auth.js";
import credentialController from "../controllers/credential.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router.route("/all").get(credentialController.getAll);
router
    .route("/")
    .get(credentialController.getCredentialByHash)
    .post(credentialController.saveCredential)
    .put(credentialController.updateCredential);

export default router;
