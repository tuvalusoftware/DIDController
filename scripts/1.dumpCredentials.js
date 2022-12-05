import GithubProxyConfig from "../db/github/index.js";
import { dumpDataToJSON } from "../utils/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

(async () => {
    const branches = await GithubProxy.getAllBranches();
    const credential_branches = branches.filter((el) =>
        el.name.includes("CRE_")
    );

    // Get credentials' contents
    let credentials = [];
    for (let branch of credential_branches) {
        console.log("Fetching branch: ", branch.name);
        const latestCommitSHA = branch.commit.sha;

        const files = await GithubProxy.getFilesOfTree(
            "",
            false,
            latestCommitSHA,
            true
        );

        credentials.push(...files);
    }

    console.log(`Number of credentials: ${credentials.length}`);
    dumpDataToJSON(credentials, "credentials");
})();
