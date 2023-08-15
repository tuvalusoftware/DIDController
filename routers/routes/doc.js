import express from "express";
import authController from "../controllers/auth.js";
import docController from "../controllers/doc.js";

const router = express.Router();

router.use(authController.ensureSecurityServiceAuthentication);

router.route("/exists").get(docController.isExist);
router.route("/search-content").get(docController.searchContent);
router
    .route("/")
    .get(docController.getDoc)
    .post(docController.createNewDoc)
    .put(docController.updateDidDocController)
    .delete(docController.deleteDoc);
router.route("/clone").post(docController.createNewDoc);
router.route("/update").put(docController.updateWrappedDocController);
router.route("/user").get(docController.getDocsByUser);
router.route("/did-doc-history").get(docController.getDidDocHistory);

export default router;
