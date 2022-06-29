import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import SchemaValidator from "../../schema/schemaValidator.js";
import { validateObject } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

export default {
    getCredentialsByPublicKey: async (req, res, next) => {
        const companyName = req.header("companyName");
        const publicKey = req.header("publicKey");

        if (!companyName || !publicKey) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branchLatestSHA = await GithubProxy.getBranchLastCommitSHA(
                `DID_${companyName}`
            );

            const filesInfo = await GithubProxy.getFilesOfTree(
                publicKey,
                false,
                branchLatestSHA,
                true
            );

            const files = filesInfo.map((el) => JSON.parse(el.object.text));

            res.status(200).json(files);
            Logger.apiInfo(
                req,
                res,
                `Get credentials of '${publicKey}' from company ${companyName}`
            );
        } catch (err) {
            if (err === ERROR_CODES.FOLDER_NOT_EXISTED) {
                return next(ERROR_CODES.BLOB_NOT_EXISTED);
            }

            next(err);
        }
    },
    saveCredential: async (req, res, next) => {
        const { publicKey, companyName, credential } = req.body;

        if (!companyName || !publicKey || !credential) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            // Validate the credential param
            if (!SchemaValidator.validate(credential, "CREDENTIAL"))
                return next(ERROR_CODES.CREDENTIAL_INVALID);

            // Catch error if file does not exist
            const branch = `DID_${companyName}`;
            const isPublicKeyExist = await GithubProxy.isExistedFile(
                `${publicKey}.did`,
                branch
            );

            if (!isPublicKeyExist) return next(ERROR_CODES.BLOB_NOT_EXISTED);

            // Save new credential
            const now = Date.now();
            const fileName = `${publicKey}/credential_${now}.cre`;
            await GithubProxy.createNewFile(
                fileName,
                credential,
                branch,
                `NEW: '${fileName}' credential from '${publicKey}' of company "${companyName}"`
            );

            res.status(201).json(SUCCESS_CODES.SAVE_SUCCESS);
            Logger.apiInfo(
                req,
                res,
                `Create new credential '${fileName}' from '${publicKey}' from company ${companyName}`
            );
        } catch (err) {
            return next(err);
        }
    },
};
