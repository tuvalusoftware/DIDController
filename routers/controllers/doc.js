import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import SchemaValidator from "../../schema/schemaValidator.js";
import { extractOwnerPKFromAddress } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

export default {
    isExist: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");
        Logger.apiInfo(req, res, `CHECK FILE EXISTENCE`);

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
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            return next(err);
        }
    },
    getDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");
        const only = req.query.only;
        Logger.apiInfo(req, res, `GET WRAPPED DOCUMENT/DID DOCUMENT`);

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
        } catch (err) {
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            if (err === ERROR_CODES.BLOB_NOT_EXISTED)
                return next(ERROR_CODES.FILE_NOT_FOUND);

            next(err);
        }
    },
    getDocsByUser: async (req, res, next) => {
        const companyName = req.header("companyName");
        const ownerPublicKey = req.header("publicKey");

        Logger.apiInfo(req, res, `RETRIEVE ALL DOCS BY ISSUER'S PUBLIC KEY`);

        if (!companyName || !ownerPublicKey) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const branchLastCommitSHA =
                await GithubProxy.getBranchLastCommitSHA(branch);

            // Get all files in a company branch
            const allFiles = await GithubProxy.getFilesOfTree(
                "",
                false,
                branchLastCommitSHA,
                true
            );

            // Filter and Parse DID File contents
            const didFiles = allFiles
                .filter((file) => file.name.includes(".did"))
                .map((file) => ({
                    name: file.name,
                    content: JSON.parse(file.object.text),
                }));

            // Filter through the DID document to find documents that belong to the owner or holder
            const filesBelongToOwner = didFiles.filter(
                (file) =>
                    file.content.owner === ownerPublicKey ||
                    file.content.holder === ownerPublicKey
            );

            const documents = filesBelongToOwner.map((file) => {
                const fileContent = allFiles.find(
                    (f) => f.name === file.content.url
                );

                return JSON.parse(fileContent.object.text);
            });

            return res.status(200).json(documents);
        } catch (err) {
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            next(err);
        }
    },
    searchContent: async (req, res, next) => {
        const { companyName, searchString } = req.query;
        Logger.apiInfo(req, res, `SEARCH A STRING IN DOCUMENT`);

        if (!companyName || !searchString) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const branchLastCommitSHA =
                await GithubProxy.getBranchLastCommitSHA(branch);

            // Get all files in a branch
            const files = await GithubProxy.getFilesOfTree(
                "",
                false,
                branchLastCommitSHA,
                true
            );

            // Find documents that contains the search string
            let results = files.filter(
                (file) =>
                    file.name.includes(".document") &&
                    file.object.text.includes(searchString)
            );

            // Parse content to JS object
            results = results.map((file) => JSON.parse(file.object.text));

            res.status(200).json(results);
        } catch (err) {
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

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
            !isCloned ? `CREATE A NEW DOCUMENT` : `CLONE A NEW DOCUMENT`
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
            if (err === ERROR_CODES.INVALID_REF_NAME)
                return next(ERROR_CODES.COMPANY_NAME_INVALID);

            if (err === ERROR_CODES.BLOB_EXISTED) {
                return next(ERROR_CODES.FILE_EXISTED);
            }

            next(err);
        }
    },
    deleteDoc: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        Logger.apiInfo(req, res, `DELETE DOCUMENT`);

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
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            if (err === ERROR_CODES.BLOB_NOT_EXISTED)
                return next(ERROR_CODES.FILE_NOT_FOUND);

            next(err);
        }
    },
    updateDidDocController: async (req, res, next) => {
        const { didDoc, fileName, companyName } = req.body;

        Logger.apiInfo(req, res, `UPDATE DID DOCUMENT OF WRAPPED DOCUMENT`);

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
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            next(err);
        }
    },
    getDidDocHistory: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("fileName");

        Logger.apiInfo(req, res, `GET HISTORY OF DID DOCUMENT`);

        if (!companyName || !fileName) {
            return next(ERROR_CODES.MISSING_PARAMETERS);
        }

        try {
            const branch = `DOC_${companyName}`;
            const didDocFile = `${fileName}.did`;

            const data = await GithubProxy.getFileHistory(didDocFile, branch);
            res.status(200).json(data);
        } catch (err) {
            if (err === ERROR_CODES.BRANCH_NOT_EXISTED)
                return next(ERROR_CODES.COMPANY_NOT_FOUND);

            if (err === ERROR_CODES.BLOB_NOT_EXISTED)
                return next(ERROR_CODES.FILE_NOT_FOUND);

            next(err);
        }
    },
};
