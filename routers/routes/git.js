import express from "express";
import authController from "../controllers/auth.js";
import git from "../controllers/git.js";
import multerParser from "../middlewares/multerParser.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router
    .route("/upload/file")
    .post(multerParser.single("uploadedFile"), git.uploadFileDirectly);
router.route("/upload/base64").post(git.uploadFileByBase64String);

export default router;
