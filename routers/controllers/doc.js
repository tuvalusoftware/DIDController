import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import SchemaValidator from "../../schema/schemaValidator.js";
import { extractOwnerPKFromAddress } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

export default {
    isExist: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");
        Logger.apiInfo(
            req,
            res,
            `Check the existence of '${fileName}' document from company ${companyName}`
        );

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
        } catch (err) {
            return next(err);
        }
    },
    getDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");
        const only = req.query.only;
        Logger.apiInfo(
            req,
            res,
            `Get wrapped document/did document '${fileName}' from company ${companyName} with param query: only = "${only}"`
        );

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        if (only && !["did", "doc"].includes(only)) {
            return next(ERROR_CODES.INVALID_QUERY_PARAMS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const branchLastCommitSHA =
                await GithubProxy.getBranchLastCommitSHA(branch);

            // Get did document only
            if (only === "did") {
                const didDoc = await GithubProxy.getFile(
                    `${fileName}.did`,
                    branchLastCommitSHA
                );
                return res.status(200).json({ didDoc: didDoc.content });
            }
            // Get document only
            else if (only === "doc") {
                const wrappedDoc = await GithubProxy.getFile(
                    `${fileName}.document`,
                    branchLastCommitSHA
                );
                return res.status(200).json({ wrappedDoc: wrappedDoc.content });
            }
            // Get both
            else {
                const [wrappedDoc, didDoc] = await Promise.all([
                    GithubProxy.getFile(
                        `${fileName}.document`,
                        branchLastCommitSHA
                    ),
                    GithubProxy.getFile(`${fileName}.did`, branchLastCommitSHA),
                ]);
                return res.status(200).json({
                    wrappedDoc: wrappedDoc.content,
                    didDoc: didDoc.content,
                });
            }
        } catch (err) {
            next(err);
        }
    },
    getDocsByUser: async (req, res, next) => {
        const companyName = req.header("companyName");
        const ownerPublicKey = req.header("publicKey");

        Logger.apiInfo(
            req,
            res,
            `Retrieve all documents issuer by '${ownerPublicKey}' document from company ${companyName}`
        );

        if (!companyName || !ownerPublicKey) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const branchLastCommitSHA =
                await GithubProxy.getBranchLastCommitSHA(branch);

            // Get all files from the given company
            const files = await GithubProxy.getFilesOfTree(
                "",
                false,
                branchLastCommitSHA
            );

            // Check the did doc for the document with the owner public key as the controller
            const didDocs = files.filter((el) => el.name.includes(".did"));
            const getDidDocContentOperations = didDocs.map((el) =>
                GithubProxy.getFile(el.name, branchLastCommitSHA)
            );
            const didDocsInfo = await Promise.all(getDidDocContentOperations);
            const ownerDocumentNames = didDocsInfo.filter(
                (el) => el.content.owner === ownerPublicKey
            );

            if (ownerDocumentNames.length === 0)
                return res.status(200).json([]);

            // Get all owner documents
            const getWrappedDocOperations = ownerDocumentNames.map((el) =>
                GithubProxy.getFile(el.content.url, branchLastCommitSHA)
            );
            const documents = await Promise.all(getWrappedDocOperations);
            const results = documents.map((el) => el.content);

            return res.status(200).json(results);
        } catch (err) {
            next(err);
        }
    },
    createNewDoc: async (req, res, next) => {
        const { wrappedDocument, fileName, companyName } = req.body;

        // Discriminate between create a new document and clone a document
        const isCloned = req.route.path === "/clone";
        Logger.apiInfo(
            req,
            res,
            !isCloned
                ? `Create a new document '${fileName}' from company ${companyName}`
                : `Clone a new document '${fileName}' from company ${companyName}`
        );

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branchName = `DOC_${companyName}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            // Get owner public key from the wrapped document
            const ownerDID = wrappedDocument.data.issuers[0].address;
            if (!ownerDID) throw ERROR_CODES.INVALID_WRAPPED_DOCUMENT;

            const ownerPublicKey = extractOwnerPKFromAddress(ownerDID);

            // Save wrapped document
            await GithubProxy.createNewFile(
                `${fileName}.document`,
                wrappedDocument,
                branchName,
                !isCloned
                    ? `NEW: '${fileName}' wrapped document from company ${companyName}`
                    : `NEW: '${fileName}' (cloned) wrapped document from company ${companyName}`
            );

            // Save the did doc for the wrapped document
            await GithubProxy.createNewFile(
                `${fileName}.did`,
                {
                    controller: [ownerPublicKey],
                    did: `did:${companyName}:${ownerPublicKey}:${ownerPublicKey}`,
                    owner: ownerPublicKey,
                    holder: ownerPublicKey,
                    url: `${fileName}.document`,
                },
                branchName,
                !isCloned
                    ? `NEW: '${fileName}' DID for new document from company ${companyName}`
                    : `NEW: '${fileName}' DID (cloned) for new document from company ${companyName}`
            );

            res.status(201).json(
                !isCloned
                    ? SUCCESS_CODES.SAVE_SUCCESS
                    : SUCCESS_CODES.CLONE_SUCCESS
            );
        } catch (err) {
            next(err);
        }
    },
    deleteDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        Logger.apiInfo(
            req,
            res,
            `Delete document '${fileName}' from company ${companyName}`
        );

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

            res.status(200).json(SUCCESS_CODES.DELETE_SUCCESS);
        } catch (err) {
            next(err);
        }
    },
    updateDidDocController: async (req, res, next) => {
        const { didDoc, fileName, companyName } = req.body;

        Logger.apiInfo(
            req,
            res,
            `Update the did doc of '${fileName}' document from company ${companyName}`
        );

        if (!companyName || !fileName || !didDoc) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            // Validate fields of did doc content
            if (
                !SchemaValidator.validate(didDoc, "WRAP_DOC_DID_DOC", {
                    fileName,
                })
            )
                return next(ERROR_CODES.WRAP_DOC_DID_DOC_INVALID);

            // Update file
            const branch = `DOC_${companyName}`;
            await GithubProxy.updateFile(
                `${fileName}.did`,
                didDoc,
                branch,
                `UPDATE: '${fileName}' did document of company ${companyName}`
            );

            res.status(200).json(SUCCESS_CODES.UPDATE_SUCCESS);
        } catch (err) {
            next(err);
        }
    },
    getDidDocHistory: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        Logger.apiInfo(
            req,
            res,
            `Get the history of did doc of '${fileName}' document from company ${companyName}`
        );

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const didDocFile = `${fileName}.did`;

            const data = await GithubProxy.getFileHistory(didDocFile, branch);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    },
};
