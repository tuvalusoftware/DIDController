import express from "express";

import didController from "../controllers/did.controller";

const router = express.Router();

router
    .route("/")
    .get(didController.getDidByPublicKey)
    .post(didController.storeDid)
    .put(didController.updateDid)
    .delete(didController.deleteDID);

router.route("/all").get(didController.getAllDidsByCompany);

export default router;
