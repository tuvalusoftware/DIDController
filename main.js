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
        // const branch = await GithubDB.createBranchIfNotExist("my_branch");
        // console.log(branch);
        // const sha = branch.object.sha;
        const sha = await GithubDB.getLastCommitSHA();
        const tag = await GithubDB.tag("test_tag Quoc Bao", sha);
        console.log(tag);
        // const tags = await GithubDB.getAllTags();
        // for (let tag of tags) {
        //     await GithubDB.deleteATag(tag.name);
        // }

        // console.log(tags);

        // const data = await GithubDB.createBranchIfNotExist("main");
        // console.log(data);

        // const data1 = await GithubDB.createBranchIfNotExist("main2");
        // console.log(data1);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
