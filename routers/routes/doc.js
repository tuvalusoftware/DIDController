import express from "express";
import docController from "../controllers/doc.js";

const router = express.Router();

router.route("/exists").get(docController.isExist);

router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createNewDoc)
    .delete(docController.deleteDoc);

router.route("/history").get(docController.getDocHistory);
router.route("/user").get(docController.getDocsByUser);

export default router;
