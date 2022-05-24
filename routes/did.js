import express from "express";

import GithubDB from "../github_db/index.js";

const router = express.Router();

router.route("/api/dids").get(async (req, res) => {
    const companyName = req.header("companyName");

    try {
        const branch = `DID_${companyName}`;
        const lastCommitOfBranch = await GithubDB.getLastCommitSHA(branch);
        const DID_strings = await GithubDB.getFilesOfTree(
            "",
            false,
            lastCommitOfBranch
        );

        const result = DID_strings.map((did) => ({
            name: did.name,
        }));

        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

router
    .route("/api/did")
    .get(async (req, res) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubDB.getLastCommitSHA(branch);

            const fileData = await GithubDB.getFile(
                `${fileName}.did`,
                lastCommitOfBranch
            );

            const data = { name: fileName, content: JSON.parse(fileData.text) };

            return res.status(200).json(data);
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    })
    .delete(async (req, res) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        try {
            const branch = `DID_${companyName}`;
            await GithubDB.deleteFile(
                `${fileName}.did`,
                branch,
                `DELETE: '${fileName}' DID of company ${companyName}`
            );

            return res.status(200).json({ message: "Delete success" });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    })
    .post(async (req, res) => {
        const { companyName, publicKey: fileName, content } = req.body;

        try {
            const newBranch = `DID_${companyName}`;
            await GithubDB.createBranchIfNotExist(newBranch);

            await GithubDB.createNewFile(
                `${fileName}.did`,
                content,
                newBranch,
                `NEW: '${fileName}' DID Doc of company "${companyName}"`
            );

            return res
                .status(201)
                .json({ message: "New DID created successfully" });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    })
    .put(async (req, res) => {
        const { companyName, publicKey: fileName, content } = req.body;

        try {
            const newBranch = `DID_${companyName}`;
            await GithubDB.createBranchIfNotExist(newBranch);

            await GithubDB.updateFile(
                `${fileName}.did`,
                content,
                newBranch,
                `UPDATE: '${fileName}' DID of company ${companyName}`
            );

            return res.status(200).json({ message: "Update DID successfully" });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    });

export default router;
