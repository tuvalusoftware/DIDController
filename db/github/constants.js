import dotenv from "dotenv";
dotenv.config();

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const token = process.env.AUTH_TOKEN;

const gitRESTUrl = `https://api.github.com/repos/${owner}/${repo}/`;
const gitGraphQLUrl = `https://api.github.com/graphql`;

const axiosHeaderConfig = {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
    },
};

export { gitRESTUrl, gitGraphQLUrl, axiosHeaderConfig };
