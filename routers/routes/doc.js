import express from "express";
import docController from "../controllers/doc.js";

const router = express.Router();

router.route("/exists").get(docController.isExist);

router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createNewDoc)
    .delete(docController.deleteDoc);

export default router;
