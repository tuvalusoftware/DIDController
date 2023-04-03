import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";
import { isBase64 } from "../../utils/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

export default {
    saveImageFromFile: async (req, res, next) => {
        Logger.apiInfo(req, res, `SAVE AN IMAGE FROM FILE TO GIT`);

        const image = req.file;
        if (!image) return next(ERROR_CODES.MISSING_PARAMETERS);

        const { buffer, originalname, size, encoding } = image;

        try {
            const { download_url } = await GithubProxy.createNewFile(
                `${Date.now()}_${originalname}`,
                buffer,
                "IMAGE",
                `NEW: 'Save an image`
            );

            return res
                .status(201)
                .json({ url: download_url, ...OPERATION_CODES.SAVE_SUCCESS });
        } catch (err) {
            return next(err);
        }
    },
    saveImageFromBase64String: async (req, res, next) => {
        Logger.apiInfo(req, res, `SAVE AN IMAGE TO GIT`);

        const { imageBase64, imageName } = req.body;

        if (!imageBase64 || !imageName)
            return next(ERROR_CODES.MISSING_PARAMETERS);
        if (!isBase64(imageBase64))
            return next(ERROR_CODES.INVALID_BASE64_STRING);

        const buffer = Buffer.from(imageBase64, "base64");

        try {
            const { download_url } = await GithubProxy.createNewFile(
                `${Date.now()}_${imageName}`,
                buffer,
                "IMAGE",
                `NEW: 'Save an image`
            );

            return res
                .status(201)
                .json({ url: download_url, ...OPERATION_CODES.SAVE_SUCCESS });
        } catch (err) {
            return next(err);
        }
    },
};
