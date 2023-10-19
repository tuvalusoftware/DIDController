import express from "express";
import docController from "../controllers/doc.controller";
const router = express.Router();

router.route("/exists").get(docController.isExist);
router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createDoc)
    .delete(docController.deleteDoc)
    .put(docController.updateDidDoc);
router.route("/clone").post(docController.createDoc);
router.route("/user").get(docController.getDocsByUser);

export default router;
