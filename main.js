import GithubDB from "./github_db/index.js";

const extractFileName = (commitMsg = "") => commitMsg.match(/'([^']+)'/)[1];

const main = async () => {
    try {
        const data = await GithubDB.testing("DOC_FPT");

        const commits = data.map((cm) => ({
            url: cm.url,
            sha: cm.sha,
            message: cm.commit.message,
            date: cm.commit.committer.date,
        }));

        let newFiles = [];
        let deletedFiles = [];

        commits.forEach((cm) => {
            if (cm.message.includes("NEW")) {
                newFiles.push(extractFileName(cm.message));
            } else if (cm.message.includes("DELETE")) {
                deletedFiles.push(extractFileName(cm.message));
            }
        });

        newFiles = [...new Set(newFiles)];
        deletedFiles = [...new Set(deletedFiles)];

        deletedFiles.forEach((fileName) => {
            newFiles = newFiles.filter((file) => file !== fileName);
        });
        console.log(newFiles);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
