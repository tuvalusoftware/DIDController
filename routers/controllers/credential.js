import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.MESSAGE_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

// The number of first letter of a receiver PK to determine its branch
const FIRST_N_LETTERS = 5;

export default {
    getCredentialByHash: async (req, res, next) => {
        const hash = req.header("hash");

        Logger.apiInfo(req, res, `Retrieve new credential`);

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

            res.status(201).json(fileData.content);
        } catch (err) {
            if (
                [
                    ERROR_CODES.BRANCH_NOT_EXISTED,
                    ERROR_CODES.FOLDER_NOT_EXISTED,
                ].includes(err)
            ) {
                return next(ERROR_CODES.CREDENTIAL_NOT_FOUND);
            }
            next(err);
        }
    },
    saveCredential: async (req, res, next) => {
        const { hash, content } = req.body;

        Logger.apiInfo(req, res, `Save new credential`);

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
};
