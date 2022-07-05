/* c8 ignore start */
import { ERROR_CODES } from "../../constants/index.js";

/**
 * @description Resolve the error returned by Github API to a simplified, easy to understand version
 * @param {Object} err an object error
 * @returns {Object} custom error object or null if there is no document on the error
 */
const detectGithubError = (err) => {
    // ** Errors returned by the Github GraphQL API are formatted as an array
    if (Array.isArray(err)) {
        const errors = err;
        errors.forEach((error) => {
            infoLogger.error(
                `Uncaught when call Github API error: Error message: ${error.message}`
            );
            debugLogger.error(
                `Uncaught when call Github API error: ${JSON.stringify(error)}`
            );
        });
        return ERROR_CODES.GITHUB_API_ERROR;
    }

    // Handle error from Github REST API
    if (
        err.response.status === 401 &&
        err.response.data.message === "Bad credentials"
    ) {
        return ERROR_CODES.BAD_CREDENTIALS;
    }

    if (
        err.response.status === 409 &&
        err.response.data.message.includes("is at") &&
        err.response.data.message.includes("but expected")
    ) {
        return ERROR_CODES.CONFLICT_PUSH;
    }

    if (
        err.response.status === 404 &&
        err.response.data.message.includes("Branch") &&
        err.response.data.message.includes("not found")
    ) {
        return ERROR_CODES.BRANCH_NOT_EXISTED;
    }

    if (
        err.response.status === 404 &&
        err.response.data.message.includes("No commit found for the ref")
    ) {
        return ERROR_CODES.BRANCH_NOT_EXISTED;
    }

    if (
        err.response?.status === 422 &&
        err.response?.data.message.includes("is not a valid ref name")
    ) {
        return ERROR_CODES.INVALID_REF_NAME;
    }

    if (
        err.response?.status === 422 &&
        err.response?.data.message === "Reference already exists"
    ) {
        return ERROR_CODES.REF_EXISTED;
    }

    if (
        err.response?.status === 422 &&
        err.response?.data.message === "Validation Failed"
    ) {
        if (Array.isArray(err.response.data.errors)) {
            for (let error of err.response.data.errors) {
                if (
                    error.resource === "Release" &&
                    error.message === "tag_name is not a valid tag"
                ) {
                    return ERROR_CODES.INVALID_REF_NAME;
                }

                if (
                    error.resource === "Release" &&
                    error.code === "already_exists"
                ) {
                    return ERROR_CODES.REF_EXISTED;
                }
            }
        }
    }

    if (
        err.response?.status === 422 &&
        err.response?.data.message.includes("Invalid request") &&
        err.response?.data.message.includes("For 'properties/sha'") &&
        err.response?.data.message.includes("is not a string")
    ) {
        return ERROR_CODES.INVALID_GIT_OBJECT_ID;
    }

    if (
        err.response?.status === 422 &&
        err.response?.data.message.includes(
            "At least 40 characters are required; only 13 were supplied"
        )
    ) {
        return ERROR_CODES.INVALID_GIT_OBJECT_ID;
    }

    return ERROR_CODES.GITHUB_API_ERROR;
};

export { detectGithubError };
/* c8 ignore stop */
