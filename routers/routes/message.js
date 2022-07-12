import express from "express";
import messageController from "../controllers/message.js";

const router = express.Router();

router
    .route("/")
    .get(messageController.getMessagesByReceiver)
    .post(messageController.saveMessage);

export default router;
