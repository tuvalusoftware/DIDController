import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import { mockCall } from "../../helpers/index.js";

export default {
    isExist: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branchName = `DOC_${companyName}`;
            const isExisted = await GithubProxy.isExistedFile(
                `${fileName}.document`,
                branchName
            );

            res.status(200).json({ isExisted });
            Logger.apiInfo(
                req,
                res,
                `Check the existence of '${fileName}' document from company ${companyName}`
            );
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    getDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                branch
            );

            const fileData = await GithubProxy.getFile(
                `${fileName}.document`,
                lastCommitOfBranch
            );

            const data = { content: JSON.parse(fileData.text) };

            return res.status(200).json(data);
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    createNewDoc: async (req, res, next) => {
        const { wrappedDocument, fileName, companyName } = req.body;

        if (!companyName || !fileName) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branchName = `DOC_${companyName}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            const ownerPublicKey = await mockCall();

            await GithubProxy.createNewFile(
                `${fileName}.document`,
                wrappedDocument,
                branchName,
                `NEW: '${fileName}' wrapped document from company ${companyName}`
            );

            await GithubProxy.createNewFile(
                `${fileName}.did`,
                {
                    controller: ownerPublicKey,
                    did: `did:some_string:${companyName}:${ownerPublicKey}`,
                },
                branchName,
                `NEW: '${fileName}' DID for new document from company ${companyName}`
            );

            res.status(201).json({
                data: { message: "Create document success" },
            });
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    deleteDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;

            await GithubProxy.deleteFile(
                `${fileName}.document`,
                branch,
                `DELETE: '${fileName}' document of doc company ${companyName}`
            );
            await GithubProxy.deleteFile(
                `${fileName}.did`,
                branch,
                `DELETE: '${fileName}' DID of doc company ${companyName}`
            );

            return res
                .status(200)
                .json({ message: "Delete document successfully" });
        } catch (err) {
            return res.status(200).json(err);
        }
    },
};
