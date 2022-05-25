import axios from "axios";

import { gitGraphQLUrl, axiosHeaderConfig } from "./constants.js";

export default {
    /**
     * @description Make API call to the GraphQL Github API
     * @param {String} queryString A GraphQL query string
     * @returns {Promise} an Axios promise
     */
    execute(queryString) {
        return axios.post(
            gitGraphQLUrl,
            JSON.stringify({ query: queryString }),
            axiosHeaderConfig
        );
    },
};
