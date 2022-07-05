import express from "express";
import docController from "../controllers/doc.js";

const router = express.Router();

router.route("/exists").get(docController.isExist);

router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createNewDoc)
    .put(docController.updateDidDocController)
    .delete(docController.deleteDoc);

router.route("/clone").post(docController.createNewDoc);
router.route("/user").get(docController.getDocsByUser);
router.route("/did-doc-history").get(docController.getDidDocHistory);

export default router;
