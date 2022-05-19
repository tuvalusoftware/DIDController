import GithubDB from "./github_db/index.js";

const main = async () => {
    try {
        const sha = await GithubDB.getLastCommitSHA("DID_Kukulu");
        console.log(sha);

        const data = await GithubDB.deleteARelease("test_release.v01");
        console.log(data);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
