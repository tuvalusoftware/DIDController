import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

// The number of first letter of a receiver PK to determine its branch
const FIRST_N_LETTERS = 1;

export default {
    getAll: async (req, res, next) => {
        Logger.apiInfo(req, res, `GET ALL CREDENTIALS`);
        try {
            const branches = await GithubProxy.getAllBranches();
            const credential_branches = branches.filter((el) =>
                el.name.includes("CRE")
            );

            // Get credentials' contents
            let credentials = [];
            for (let branch of credential_branches) {
                const latestCommitSHA = branch.commit.sha;

                const files = await GithubProxy.getFilesOfTree(
                    "",
                    false,
                    latestCommitSHA,
                    true
                );

                credentials.push(...files);
            }

            credentials = credentials.map((el) => JSON.parse(el.object.text));
            res.status(200).json(credentials);
        } catch (e) {
            next(e);
        }
    },
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

            res.status(201).json(OPERATION_CODES.SAVE_SUCCESS);
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

            res.status(200).json(OPERATION_CODES.UPDATE_SUCCESS);
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
