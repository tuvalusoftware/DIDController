import express from "express";
import { mockCall } from "../helpers/index.js";

const router = express.Router();

router.route("/api/get-hash").get(async (req, res) => {
    try {
        const data = await mockCall();
        return res.status(200).json({ hash: data });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

export default router;
