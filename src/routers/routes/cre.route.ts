import express from "express";

import creController from "../controllers/cre.controller";

const router = express.Router();

router.route("/").post(creController.storeVC);

router.route("/all").get(creController.getAll);

export default router;
