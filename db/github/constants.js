import dotenv from "dotenv";
dotenv.config();

const owner = process.env.REPO_OWNER;
const token = process.env.GITHUB_AUTH_TOKEN;

const gitRESTUrl = `https://api.github.com/repos/${owner}`;
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
