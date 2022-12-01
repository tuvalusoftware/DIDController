import fs from "fs/promises";
import GithubProxyConfig from "../db/github/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);
const FIRST_N_LETTERS = 1;

(async () => {
    try {
        const data = await fs.readFile("./credentials.json", "utf8");
        const credentials = JSON.parse(data);

        for (let cre of credentials) {
            const hash = cre.name;
            const content = JSON.parse(cre.object.text);

            const branchName = `CRE_${hash.substring(0, FIRST_N_LETTERS)}`;
            await GithubProxy.createBranchIfNotExist(branchName);

            await GithubProxy.createNewFile(
                `${hash}.cre`,
                content,
                branchName,
                `NEW: '${hash}' credential`
            );
        }
    } catch (err) {
        console.log(err);
    }
})();
