import express from "express";
import authController from "../controllers/auth.js";
import git from "../controllers/git.js";
import multerParser from "../middlewares/multerParser.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router
    .route("/image")
    .post(multerParser.single("image"), git.saveImageFromFile);

export default router;
