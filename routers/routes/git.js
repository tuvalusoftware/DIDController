import express from "express";
import authController from "../controllers/auth.js";
import git from "../controllers/git.js";
import multerParser from "../middlewares/multerParser.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router
    .route("/image/file")
    .post(multerParser.single("image"), git.saveImageFromFile);
router.route("/image/base64").post(git.saveImageFromBase64String);

export default router;
