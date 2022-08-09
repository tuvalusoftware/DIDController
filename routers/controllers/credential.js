import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

// The number of first letter of a receiver PK to determine its branch
const FIRST_N_LETTERS = 3;

export default {
    getCredentialByHash: async (req, res, next) => {
        Logger.apiInfo(req, res, `RETRIEVE CREDENTIAL BY HASH`);

        const { hash } = req.query;
        if (!hash) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            // Determine branch name
            const branchName = `CRE_${hash.substring(0, FIRST_N_LETTERS)}`;

            // Get branch and file
            const branchLatestSHA = await GithubProxy.getBranchLastCommitSHA(
                branchName
            );
            const fileData = await GithubProxy.getFile(
                `${hash}.cre`,
                branchLatestSHA
            );

            res.status(200).json(fileData.content);
        } catch (err) {
            if (
                [
                    ERROR_CODES.BRANCH_NOT_EXISTED,
                    ERROR_CODES.BLOB_NOT_EXISTED,
                ].includes(err)
            )
                return next(ERROR_CODES.CREDENTIAL_NOT_FOUND);

            next(err);
        }
    },
    saveCredential: async (req, res, next) => {
        const { hash, content } = req.body;

        Logger.apiInfo(req, res, `SAVE NEW CREDENTIAL`);

        if (!hash || !content) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            // Determine branch name
            const branchName = `CRE_${hash.substring(0, FIRST_N_LETTERS)}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            // Save credential a file
            await GithubProxy.createNewFile(
                `${hash}.cre`,
                content,
                branchName,
                `NEW: '${hash}' credential`
            );

            res.status(201).json(SUCCESS_CODES.SAVE_SUCCESS);
        } catch (err) {
            next(err);
        }
    },
    updateCredential: async (req, res, next) => {
        const { hash, content: updatedContent } = req.body;

        Logger.apiInfo(req, res, `UPDATE CREDENTIAL`);

        if (!hash || !updatedContent)
            return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            // Determine branch name
            const branchName = `CRE_${hash.substring(0, FIRST_N_LETTERS)}`;

            await GithubProxy.updateFile(
                `${hash}.cre`,
                updatedContent,
                branchName,
                `UPDATE: '${hash}' credential`
            );

            res.status(200).json(SUCCESS_CODES.UPDATE_SUCCESS);
        } catch (err) {
            if (
                [
                    ERROR_CODES.BRANCH_NOT_EXISTED,
                    ERROR_CODES.BLOB_NOT_EXISTED,
                ].includes(err)
            )
                return next(ERROR_CODES.CREDENTIAL_NOT_FOUND);

            next(err);
        }
    },
};
