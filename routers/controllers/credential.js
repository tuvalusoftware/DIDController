import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import { validateObject } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

export default {
    saveCredential: async (req, res, next) => {
        const { publicKey, companyName, credential } = req.body;

        if (!companyName || !publicKey || !credential) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        if (
            !validateObject(
                ["issuer", "credentialSubject", "signature"],
                credential
            )
        )
            return next(ERROR_CODES.CREDENTIAL_CONTENT_INVALID);

        try {
            // Catch if file exists
            const branch = `DID_${companyName}`;
            const isPublicKeyExist = await GithubProxy.isExistedFile(
                `${publicKey}.did`,
                branch
            );

            if (!isPublicKeyExist) return next(ERROR_CODES.FILE_NOT_EXISTED);

            // Save new credential
            const now = Date.now();
            const fileName = `${publicKey}/credential_${now}.cre`;
            await GithubProxy.createNewFile(
                fileName,
                credential,
                branch,
                `NEW: '${fileName}' credential from '${publicKey}' of company "${companyName}"`
            );

            res.status(201).json({ message: SUCCESS_CODES.SAVE_SUCCESS });
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
