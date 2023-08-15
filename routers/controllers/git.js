import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import { isBase64 } from "../../utils/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

export default {
    uploadFileDirectly: async (req, res, next) => {
        Logger.apiInfo(req, res, `UPLOAD A FILE DIRECTLY TO GIT`);

        const uploadedFile = req.file;
        if (!uploadedFile) return next(ERROR_CODES.MISSING_PARAMETERS);

        const { buffer, originalname } = uploadedFile;

        try {
            const { download_url, path } = await GithubProxy.createNewFile(
                `${Date.now()}_${encodeURIComponent(originalname)}`,
                buffer,
                "IMAGE",
                `NEW: 'Save an new file`
            );

            return res.status(201).json({
                url: download_url,
                path,
                ...OPERATION_CODES.SAVE_SUCCESS,
            });
        } catch (err) {
            return next(err);
        }
    },
    uploadFileByBase64String: async (req, res, next) => {
        Logger.apiInfo(req, res, `UPLOAD A FILE THROUGH BASE64 TO GIT`);

        const { base64Content, fileName } = req.body;

        if (!base64Content || !fileName)
            return next(ERROR_CODES.MISSING_PARAMETERS);
        if (!isBase64(base64Content))
            return next(ERROR_CODES.INVALID_BASE64_STRING);

        const buffer = Buffer.from(base64Content, "base64");

        try {
            const { download_url } = await GithubProxy.createNewFile(
                `${Date.now()}_${encodeURIComponent(fileName)}`,
                buffer,
                "IMAGE",
                `NEW: 'Save an new file thru base64`
            );

            return res
                .status(201)
                .json({ url: download_url, ...OPERATION_CODES.SAVE_SUCCESS });
        } catch (err) {
            return next(err);
        }
    },
    deleteFile: async (req, res, next) => {
        Logger.apiInfo(req, res, `DELETE A FILE FROM GIT`);

        const { fileName } = req.body;

        if (!fileName) return next(ERROR_CODES.MISSING_PARAMETERS);

        try {
            await GithubProxy.deleteFile(path, "IMAGE");

            return res.status(201).json({ ...OPERATION_CODES.DELETE_SUCCESS });
        } catch (err) {
            return next(err);
        }
    },
};
