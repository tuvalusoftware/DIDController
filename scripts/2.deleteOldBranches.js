import GithubProxyConfig from "../db/github/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

(async () => {
    const branches = await GithubProxy.getAllBranches();
    const credential_branches = branches.filter((el) =>
        el.name.includes("CRE_")
    );

    console.log(
        `Number of old credentials branches: ${credential_branches.length}`
    );

    for (let branch of credential_branches) {
        console.log("Deleting branch: ", branch.name);
        await GithubProxy.deleteBranch(branch.name);
    }
})();
