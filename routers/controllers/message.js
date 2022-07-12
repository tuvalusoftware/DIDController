import GithubProxy from "../../db/github/index.js";
import Logger from "../../logger.js";
import { validateDIDSyntax } from "../../utils/index.js";
import SchemaValidator from "../../schema/schemaValidator.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

// The number of first letter of a receiver PK to determine its branch
const FIRST_N_LETTERS = 5;

export default {
    getMessagesByReceiver: async (req, res, next) => {
        const receiverPK = req.header("publicKey");

        Logger.apiInfo(
            req,
            res,
            `Retrieve all messages of receiver ${receiverPK}`
        );

        if (!receiverPK) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            // Determine branch name
            const branchName = `MSG_${receiverPK.substring(
                0,
                FIRST_N_LETTERS
            )}`;

            // Get branch and files
            const branchLatestSHA = await GithubProxy.getBranchLastCommitSHA(
                branchName
            );
            const filesInfo = await GithubProxy.getFilesOfTree(
                receiverPK,
                false,
                branchLatestSHA,
                true
            );

            // Extract files' content
            const files = filesInfo.map((el) => JSON.parse(el.object.text));
            res.status(200).json(files);
        } catch (err) {
            if (err === ERROR_CODES.FOLDER_NOT_EXISTED) {
                return next(ERROR_CODES.FILE_NOT_FOUND);
            }

            next(err);
        }
    },
    saveMessage: async (req, res, next) => {
        const { message } = req.body;

        Logger.apiInfo(req, res, `Save new message`);

        if (!message) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            const { receiver: receiverDID, sender: senderDID } = message;

            // Extract Receiver and Sender Public Key
            const { fileNameOrPublicKey: receiverPK } =
                validateDIDSyntax(receiverDID);
            const { fileNameOrPublicKey: senderPK } =
                validateDIDSyntax(senderDID);

            // Determine branch name
            const branchName = `MSG_${receiverPK.substring(
                0,
                FIRST_N_LETTERS
            )}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            // Save to a file
            const fileName = `${receiverPK}/${Date.now()}_${senderPK}.msg`;
            await GithubProxy.createNewFile(
                fileName,
                message,
                branchName,
                `NEW: '${fileName}' message from '${receiverPK}'`
            );

            res.status(201).json(SUCCESS_CODES.SAVE_SUCCESS);
        } catch (err) {
            next(err);
        }
    },
};
