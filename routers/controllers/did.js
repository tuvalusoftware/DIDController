import GithubProxy from "../../db/github/index.js";
import { ERROR_CODES } from "../../constants/index.js";
import { isExistsKey } from "../../db/github/utils.js";
import Logger from "../../logger.js";

const verifyContent = (content) => {
    return isExistsKey("controller", content) && isExistsKey("id", content);
};

export default {
    getAllDIDs: async (req, res, next) => {
        const companyName = req.header("companyName");

        if (!companyName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getBranchLastCommitSHA(
                branch
            );
            const DID_strings = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );

            const result = DID_strings.map((did) => did.name);

            res.status(200).json(result);
            Logger.apiInfo(
                req,
                res,
                `Retrieve all DIDs from company ${companyName}`
            );
        } catch (err) {
            next(err);
        }
    },
    getSingleDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getBranchLastCommitSHA(
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
            next(err);
        }
    },
    createNewDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        if (!companyName || !fileName || !content) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            if (!verifyContent(content))
                return next(ERROR_CODES.DID_CONTENT_INVALID);

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
            next(err);
        }
    },
    updateDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        if (!companyName || !fileName || !content) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DID_${companyName}`;
            await GithubProxy.getBranchInfo(branch);

            await GithubProxy.updateFile(
                `${fileName}.did`,
                content,
                branch,
                `UPDATE: '${fileName}' DID of company ${companyName}`
            );

            res.status(200).json({ message: "Update DID successfully" });
            Logger.apiInfo(
                req,
                res,
                `Update DID '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            next(err);
        }
    },
    deleteDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
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
            next(err);
        }
    },
};
