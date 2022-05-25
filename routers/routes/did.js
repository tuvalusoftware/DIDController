import express from "express";
import didController from "../controllers/did.js";

const router = express.Router();

router.route("/all").get(didController.getAllDIDs);

router
    .route("/")
    .get(didController.getSingleDID)
    .post(didController.createNewDID)
    .put(didController.updateDID)
    .delete(didController.deleteDID);

export default router;
