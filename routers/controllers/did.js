import GithubProxy from "../../db/github/index.js";
import { ERROR_CODES } from "../../constants/index.js";
import Logger from "../../logger.js";

export default {
    getAllDIDs: async (req, res, next) => {
        const companyName = req.header("companyName");

        if (!companyName) {
            return res.status(200).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                branch
            );
            const DID_strings = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );

            const result = DID_strings.map((did) => ({
                name: did.name,
            }));

            res.status(200).json(result);
            Logger.apiInfo(
                req,
                res,
                `Retrieve all DIDs from company ${companyName}`
            );
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    getSingleDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        if (!companyName || !fileName) {
            return res.status(200).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                branch
            );

            const fileData = await GithubProxy.getFile(
                `${fileName}.did`,
                lastCommitOfBranch
            );

            const data = { name: fileName, content: JSON.parse(fileData.text) };

            res.status(200).json(data);
            Logger.apiInfo(
                req,
                res,
                `Retrieve DID '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    createNewDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        if (!companyName || !fileName || !content) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            await GithubProxy.createNewFile(
                `${fileName}.did`,
                content,
                newBranch,
                `NEW: '${fileName}' DID Doc of company "${companyName}"`
            );

            res.status(201).json({ message: "New DID created successfully" });

            Logger.apiInfo(
                req,
                res,
                `Create new DID with '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    updateDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        if (!companyName || !fileName || !content) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            await GithubProxy.updateFile(
                `${fileName}.did`,
                content,
                newBranch,
                `UPDATE: '${fileName}' DID of company ${companyName}`
            );

            res.status(200).json({ message: "Update DID successfully" });
            Logger.apiInfo(
                req,
                res,
                `Update DID '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    deleteDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        if (!companyName || !fileName) {
            return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            await GithubProxy.deleteFile(
                `${fileName}.did`,
                branch,
                `DELETE: '${fileName}' DID of company ${companyName}`
            );

            res.status(200).json({ message: "Delete success" });
            Logger.apiInfo(
                req,
                res,
                `Delete DID '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            return res.status(400).json(err);
        }
    },
};
