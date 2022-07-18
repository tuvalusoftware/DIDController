import express from "express";
import messageController from "../controllers/message.js";

const router = express.Router();

router
    .route("/")
    .get(messageController.getMessageByID)
    .post(messageController.saveMessage);
router.route("/receiver").get(messageController.getMessagesByReceiver);

export default router;
