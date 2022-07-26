import axios from "axios";
import { axiosHeaderConfig, gitRESTUrl } from "./constants.js";

const token = process.env.AUTH_TOKEN;

/* c8 ignore start */
const constructURL = (repository, path) => {
    return path
        ? `${gitRESTUrl}/${repository}/${path}`
        : `${gitRESTUrl}/${repository}`;
};
/* c8 ignore stop */

const GithubREST = (REPOSITORY) => ({
    get(path) {
        return axios.get(constructURL(REPOSITORY, path), axiosHeaderConfig);
    },
    post(path, data) {
        return axios.post(
            constructURL(REPOSITORY, path),
            data,
            axiosHeaderConfig
        );
    },
    put(path, data) {
        return axios.put(
            constructURL(REPOSITORY, path),
            data,
            axiosHeaderConfig
        );
    },
    patch(path, data) {
        return axios.patch(
            constructURL(REPOSITORY, path),
            data,
            axiosHeaderConfig
        );
    },
    delete(path, data = {}) {
        return axios.delete(constructURL(REPOSITORY, path), {
            data,
            ...axiosHeaderConfig,
        });
    },
    search(queryString) {
        return axios.get(`https://api.github.com/search/code?${queryString}`, {
            headers: {
                Accept: "application/vnd.github.text-match+json",
                Authorization: `token ${token}`,
            },
        });
    },
});

export default GithubREST;
