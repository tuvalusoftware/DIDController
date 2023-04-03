import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import Logger from "../../logger.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

export default {
    saveImageFromFile: async (req, res, next) => {
        Logger.apiInfo(req, res, `SAVE AN IMAGE TO GIT`);

        const image = req.file;
        if (!image) return next(ERROR_CODES.MISSING_PARAMETERS);

        const { buffer, originalname, size, encoding } = image;

        try {
            await GithubProxy.createBranchIfNotExist("IMAGE");
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
};
