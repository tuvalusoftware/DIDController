/* c8 ignore start */
import express from "express";
import authController from "../controllers/auth.js";

const router = express.Router();

router.route("/set-token").get(authController.setCookie);
router.route("/clear-token").get(authController.clearCookie);

export default router;
/* c8 ignore stop */
