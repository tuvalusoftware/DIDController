import express from "express";
import messageController from "../controllers/message.js";
import authController from "../controllers/auth.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router
    .route("/")
    .get(messageController.getMessageByID)
    .post(messageController.saveMessage);
router.route("/receiver").get(messageController.getMessagesByReceiver);

export default router;
