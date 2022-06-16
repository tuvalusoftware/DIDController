import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

export default {
    isExist: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
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
            return next(err);
        }
    },
    getDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        const only = req.query.only;

        try {
            const branch = `DOC_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getBranchLastCommitSHA(
                branch
            );

            // Get did document only
            if (only === "did") {
                const didDoc = await GithubProxy.getFile(
                    `${fileName}.did`,
                    lastCommitOfBranch
                );
                Logger.apiInfo(
                    req,
                    res,
                    `Get only did document '${fileName}' from company ${companyName}`
                );
                return res.status(200).json({ didDoc: didDoc.content });
            }
            // Get document only
            else if (only === "doc") {
                const wrappedDoc = await GithubProxy.getFile(
                    `${fileName}.document`,
                    lastCommitOfBranch
                );
                Logger.apiInfo(
                    req,
                    res,
                    `Get only wrapped document '${fileName}' from company ${companyName}`
                );
                return res.status(200).json({ wrappedDoc: wrappedDoc.content });
            }
            // Get both did document
            else {
                const [wrappedDoc, didDoc] = await Promise.all([
                    GithubProxy.getFile(
                        `${fileName}.document`,
                        lastCommitOfBranch
                    ),
                    GithubProxy.getFile(`${fileName}.did`, lastCommitOfBranch),
                ]);
                Logger.apiInfo(
                    req,
                    res,
                    `Get both document '${fileName}' from company ${companyName}`
                );
                return res.status(200).json({
                    wrappedDoc: wrappedDoc.content,
                    didDoc: didDoc.content,
                });
            }
        } catch (err) {
            next(err);
        }
    },
    createNewDoc: async (req, res, next) => {
        const { wrappedDocument, fileName, companyName } = req.body;

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branchName = `DOC_${companyName}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            const ownerPublicKey = wrappedDocument.data.issuers[0].address;
            if (!ownerPublicKey) throw ERROR_CODES.INVALID_WRAPPED_DOCUMENT;

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
                    docController: ownerPublicKey,
                    url: `${fileName}.document`,
                },
                branchName,
                `NEW: '${fileName}' DID for new document from company ${companyName}`
            );

            res.status(201).json({
                data: { message: SUCCESS_CODES.SAVE_SUCCESS },
            });
            Logger.apiInfo(
                req,
                res,
                `Create new document '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            return next(err);
        }
    },
    deleteDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
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

            res.status(200).json({ message: SUCCESS_CODES.DELETE_SUCCESS });
            Logger.apiInfo(
                req,
                res,
                `Delete document '${fileName}' from company ${companyName}`
            );
        } catch (err) {
            next(err);
        }
    },
};
