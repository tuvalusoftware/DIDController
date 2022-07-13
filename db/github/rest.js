import axios from "axios";

import { axiosHeaderConfig, gitRESTUrl } from "./constants.js";

const GithubREST = (REPOSITORY) => ({
    get(path) {
        return axios.get(
            `${gitRESTUrl}/${REPOSITORY}/${path}`,
            axiosHeaderConfig
        );
    },
    post(path, data) {
        return axios.post(
            `${gitRESTUrl}/${REPOSITORY}/${path}`,
            data,
            axiosHeaderConfig
        );
    },
    put(path, data) {
        return axios.put(
            `${gitRESTUrl}/${REPOSITORY}/${path}`,
            data,
            axiosHeaderConfig
        );
    },
    patch(path, data) {
        return axios.patch(
            `${gitRESTUrl}/${REPOSITORY}/${path}`,
            data,
            axiosHeaderConfig
        );
    },
    delete(path, data = {}) {
        return axios.delete(`${gitRESTUrl}/${REPOSITORY}/${path}`, {
            data,
            ...axiosHeaderConfig,
        });
    },
});

export default GithubREST;
