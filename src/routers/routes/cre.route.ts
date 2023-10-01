import express from "express";

import creController from "../controllers/cre.controller";

const router = express.Router();

router
    .route("/")
    .get(creController.getByHash)
    .post(creController.storeVC)
    .put(creController.updateVC);
router.route("/all").get(creController.getAll);
router.route("/:id").get(creController.getById);

export default router;
