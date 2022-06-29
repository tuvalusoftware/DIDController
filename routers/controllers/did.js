import GithubProxy from "../../db/github/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";
import SchemaValidator from "../../schema/schemaValidator.js";
import Logger from "../../logger.js";

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
            // Validate user's did document
            if (!SchemaValidator.validate(content, "USER_DID_DOC"))
                return next(ERROR_CODES.USER_DID_DOC_INVALID);

            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            await GithubProxy.createNewFile(
                `${fileName}.did`,
                content,
                newBranch,
                `NEW: '${fileName}' DID Doc of company "${companyName}"`
            );

            res.status(201).json(SUCCESS_CODES.SAVE_SUCCESS);
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
            // Validate user's did document
            if (!SchemaValidator.validate(content, "USER_DID_DOC"))
                return next(ERROR_CODES.USER_DID_DOC_INVALID);

            const branch = `DID_${companyName}`;
            await GithubProxy.updateFile(
                `${fileName}.did`,
                content,
                branch,
                `UPDATE: '${fileName}' DID of company ${companyName}`
            );

            res.status(200).json(SUCCESS_CODES.UPDATE_SUCCESS);
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

            res.status(200).json(SUCCESS_CODES.DELETE_SUCCESS);
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
