/* c8 ignore start */
import express from "express";
import authController from "../controllers/auth.js";

const router = express.Router();

router
    .route("/")
    .post(authController.setCookie)
    .get(authController.clearCookie);

export default router;
/* c8 ignore stop */
