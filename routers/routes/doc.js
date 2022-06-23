import express from "express";
import docController from "../controllers/doc.js";

const router = express.Router();

router.route("/exists").get(docController.isExist);

router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createNewDoc)
    .put(docController.changeDidDocController)
    .delete(docController.deleteDoc);

router.route("/user").get(docController.getDocsByUser);
router
    .route("/changeOwnershipOrHoldershipOrBoth")
    .put(docController.changeDidDocController);

export default router;
