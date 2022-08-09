import axios from "axios";
import Logger from "../../logger.js";
import { ERROR_CODES, SERVICES } from "../../constants/index.js";

export default {
    /* c8 ignore start */
    ensureSecurityServiceAuthentication: async (req, res, next) => {
        // Ignore Security Service If In Test Environment
        if (process.env.NODE_ENV === "test") return next();

        Logger.apiInfo(req, res, "ENSURE AUTHENTICATION FROM SECURITY SERVICE");

        const token = req.cookies["access_token"];
        if (!token) {
            return next(ERROR_CODES.AUTHENTICATION);
        }

        // Call to Security Service to verify the access token
        try {
            const response = await axios.get(
                `${SERVICES.AUTH_HTTPS}/api/auth/verify`,
                {
                    withCredentials: true,
                    headers: {
                        Cookie: `access_token=${token};`,
                    },
                }
            );

            req.userData = {
                token,
                address: response.data.data.address,
            };

            next();
        } catch (err) {
            if (
                err.response.data === "Unauthorized" &&
                err.response.status === 401
            ) {
                return next(ERROR_CODES.AUTHENTICATION);
            }

            next(err);
        }
    },
    setCookie: async (req, res, next) => {
        const { accessToken } = req.body;
        res.cookie("access_token", accessToken);
        res.json({ message: "Set Cookie Successfully" });
    },
    clearCookie: async (req, res, next) => {
        res.clearCookie("access_token");
        res.json({ message: "Clear Cookie Successfully" });
    },
    /* c8 ignore stop */
};
