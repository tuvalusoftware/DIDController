import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import { validateDIDSyntax } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.MESSAGE_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

// The number of first letter of a receiver PK to determine its branch
const FIRST_N_LETTERS = 5;

export default {
    getMessageByID: async (req, res, next) => {
        const receiverPK = req.header("publicKey");
        const msgID = req.header("msgID");

        Logger.apiInfo(
            req,
            res,
            `Retrieve a message with ID: ${msgID} of receiver ${receiverPK}`
        );

        if (!msgID || !receiverPK) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            // Determine branch name
            const branchName = `MSG_${receiverPK.substring(
                0,
                FIRST_N_LETTERS
            )}`;

            // Get branch and file
            const branchLatestSHA = await GithubProxy.getBranchLastCommitSHA(
                branchName
            );
            const fileData = await GithubProxy.getFile(
                `${receiverPK}/${msgID}.msg`,
                branchLatestSHA
            );

            res.status(200).json(JSON.parse(fileData.text));
        } catch (err) {
            // Convert to human-readable message
            if (
                [
                    ERROR_CODES.BLOB_NOT_EXISTED,
                    ERROR_CODES.BRANCH_NOT_EXISTED,
                ].includes(err)
            ) {
                return next(ERROR_CODES.MESSAGE_NOT_FOUND);
            }

            next(err);
        }
    },
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
            // Convert to human-readable message
            if (
                [
                    ERROR_CODES.FOLDER_NOT_EXISTED,
                    ERROR_CODES.BRANCH_NOT_EXISTED,
                ].includes(err)
            ) {
                return next(ERROR_CODES.MESSAGE_NOT_FOUND);
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
            const { valid: receiverPkValid, fileNameOrPublicKey: receiverPK } =
                validateDIDSyntax(receiverDID);
            const { valid: senderPkValid, fileNameOrPublicKey: senderPK } =
                validateDIDSyntax(senderDID);

            if (!receiverPkValid || !senderPkValid) {
                return next(ERROR_CODES.MESSAGE_CONTENT_INVALID);
            }

            // Determine branch name
            const branchName = `MSG_${receiverPK.substring(
                0,
                FIRST_N_LETTERS
            )}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            // Save to a file
            const msgId = `${Date.now()}_${senderPK}`,
                fileName = `${receiverPK}/${msgId}.msg`;

            await GithubProxy.createNewFile(
                fileName,
                { id: msgId, ...message },
                branchName,
                `NEW: '${fileName}' message from '${receiverPK}'`
            );

            res.status(201).json(SUCCESS_CODES.SAVE_SUCCESS);
        } catch (err) {
            next(err);
        }
    },
};
