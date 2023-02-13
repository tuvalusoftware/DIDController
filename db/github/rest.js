import axios from "axios";
import {
    gitRESTUrl,
    headerConfigGitJSON,
    headerConfigGitRAW,
} from "./constants.js";

const token = process.env.GITHUB_AUTH_TOKEN;

/* c8 ignore start */
const constructURL = (repository, path) => {
    return path
        ? `${gitRESTUrl}/${repository}/${path}`
        : `${gitRESTUrl}/${repository}`;
};
/* c8 ignore stop */

const GithubREST = (REPOSITORY) => ({
    get(path, getRaw = false) {
        // Header config for different data types
        const header = getRaw ? headerConfigGitRAW : headerConfigGitJSON;
        return axios.get(constructURL(REPOSITORY, path), header);
    },
    post(path, data) {
        return axios.post(
            constructURL(REPOSITORY, path),
            data,
            headerConfigGitJSON
        );
    },
    put(path, data) {
        return axios.put(
            constructURL(REPOSITORY, path),
            data,
            headerConfigGitJSON
        );
    },
    patch(path, data) {
        return axios.patch(
            constructURL(REPOSITORY, path),
            data,
            headerConfigGitJSON
        );
    },
    delete(path, data = {}) {
        return axios.delete(constructURL(REPOSITORY, path), {
            data,
            ...headerConfigGitJSON,
        });
    },
    /* c8 ignore start */
    search(queryString) {
        return axios.get(`https://api.github.com/search/code?${queryString}`, {
            headers: {
                Accept: "application/vnd.github.text-match+json",
                Authorization: `token ${token}`,
            },
        });
    },
    /* c8 ignore stop */
});

export default GithubREST;
