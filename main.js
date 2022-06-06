import GithubDB from "./db/github/index.js";

const extractFileName = (commitMsg = "") => commitMsg.match(/'([^']+)'/)[1];

const main = async () => {
    try {
        // const data = await GithubDB.testing("DOC_FPT");

        // const commits = data.map((cm) => ({
        //     url: cm.url,
        //     sha: cm.sha,
        //     message: cm.commit.message,
        //     date: cm.commit.committer.date,
        // }));

        // let newFiles = [];
        // let deletedFiles = [];

        // commits.forEach((cm) => {
        //     if (cm.message.includes("NEW")) {
        //         newFiles.push(extractFileName(cm.message));
        //     } else if (cm.message.includes("DELETE")) {
        //         deletedFiles.push(extractFileName(cm.message));
        //     }
        // });

        // newFiles = [...new Set(newFiles)];
        // deletedFiles = [...new Set(deletedFiles)];

        // deletedFiles.forEach((fileName) => {
        //     newFiles = newFiles.filter((file) => file !== fileName);
        // });
        // console.log(newFiles);

        // await GithubDB.deleteBranchIfExist("DID_MOCHA_TESTING");

        const data = await GithubDB.checkoutNewBranch(
            "branch_new",
            "empty_branch"
        );

        console.log(data);

        // await
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
