import express from "express";

import GithubDB from "../github_db/index.js";
import { mockCall } from "../helpers/index.js";

const router = express.Router();

router.route("/api/doc-exists").get(async (req, res) => {
    const companyName = req.header("companyName");
    const fileName = req.header("fileName");

    try {
        const branchName = `DOC_${companyName}`;
        const isExisted = await GithubDB.isExistedFile(
            `${fileName}.document`,
            branchName
        );

        res.status(200).json({ isExisted });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

router
    .route("/api/doc")
    .get(async (req, res) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        try {
            const branch = `DOC_${companyName}`;
            const lastCommitOfBranch = await GithubDB.getLastCommitSHA(branch);

            const fileData = await GithubDB.getFile(
                `${fileName}.document`,
                lastCommitOfBranch
            );

            const data = { content: JSON.parse(fileData.text) };

            return res.status(200).json(data);
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    })
    .post(async (req, res) => {
        const { wrappedDocument, fileName, companyName } = req.body;

        try {
            const branchName = `DOC_${companyName}`;
            await GithubDB.createBranchIfNotExist(branchName);

            const ownerPublicKey = await mockCall();

            await GithubDB.createNewFile(
                `${fileName}.document`,
                wrappedDocument,
                branchName,
                `NEW: '${fileName}' wrapped document from company ${companyName}`
            );

            await GithubDB.createNewFile(
                `${fileName}.did`,
                {
                    controller: ownerPublicKey,
                    did: `did:some_string:${companyName}:${ownerPublicKey}`,
                },
                branchName,
                `NEW: '${fileName}' DID for new document from company ${companyName}`
            );

            res.status(200).json({
                data: { message: "Create document success" },
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    })
    .delete(async (req, res) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        try {
            const branch = `DOC_${companyName}`;

            await GithubDB.deleteFile(
                `${fileName}.document`,
                branch,
                `DELETE: '${fileName}' document of doc company ${companyName}`
            );
            await GithubDB.deleteFile(
                `${fileName}.did`,
                branch,
                `DELETE: '${fileName}' DID of doc company ${companyName}`
            );

            return res
                .status(200)
                .json({ message: "Delete document successfully" });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    });


export default router;
