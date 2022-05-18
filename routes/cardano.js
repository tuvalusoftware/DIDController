import express from "express";

const router = express.Router();

router.route("/api/get-hash").get(async (req, res) => {
    try {
        return res.status(200).json({ hash: "this_is_an_example_hash" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

export default router;
