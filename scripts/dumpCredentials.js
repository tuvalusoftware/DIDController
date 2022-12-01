import GithubProxyConfig from "../db/github/index.js";
import { dumpDataToJSON } from "../utils/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

(async () => {
    const branches = await GithubProxy.getAllBranches();
    const credential_branches = branches.filter((el) => el.name.includes(""));

    // Get credentials' contents
    let credentials = [];
    for (let branch of credential_branches) {
        const latestCommitSHA = branch.commit.sha;

        const files = await GithubProxy.getFilesOfTree(
            "",
            false,
            latestCommitSHA,
            true
        );

        credentials.push(...files);
    }

    console.log(credentials.length);
    dumpDataToJSON(credentials, "credentials");
})();
