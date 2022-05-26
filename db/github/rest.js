import axios from "axios";

import { axiosHeaderConfig, gitRESTUrl } from "./constants.js";

const GithubREST = {
    get(url) {
        return axios.get(gitRESTUrl + url, axiosHeaderConfig);
    },
    post(url, data) {
        return axios.post(gitRESTUrl + url, data, axiosHeaderConfig);
    },
    put(url, data) {
        return axios.put(gitRESTUrl + url, data, axiosHeaderConfig);
    },
    patch(url, data) {
        return axios.patch(gitRESTUrl + url, data, axiosHeaderConfig);
    },
    delete(url, data = {}) {
        return axios.delete(gitRESTUrl + url, { data, ...axiosHeaderConfig });
    },
};

export default GithubREST;
