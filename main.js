import GithubDB from "./github_db/index.js";

const main = async () => {
    try {
        const data = await GithubDB.testing("random_string", "DID_Kukulu");

        console.log(data);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
