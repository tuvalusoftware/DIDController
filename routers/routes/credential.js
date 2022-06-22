import express from "express";
import credentialController from "../controllers/credential.js";

const router = express.Router();

router.route("/").post(credentialController.saveCredential);

export default router;
