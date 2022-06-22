import GithubDB from "./db/github/index.js";
import { extractOwnerPKFromDID } from "./utils/index.js";

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
        // const sha = await GithubDB.getBranchLastCommitSHA();
        // const tag = await GithubDB.tag("test_tag Quoc Bao", sha);
        // const tags = await GithubDB.getAllTags();
        // for (let tag of tags) {
        //     await GithubDB.deleteATag(tag.name);
        // }

        // console.log(tags);

        // const data = await GithubDB.createBranchIfNotExist("main");
        // console.log(data);

        // const data1 = await GithubDB.createBranchIfNotExist("main2");
        // console.log(data1);

        const pk = extractOwnerPKFromDID(
            "80d5f4d9-c405-4f5d-bcc8-b0e60c2feb08:string:0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3"
        );
        console.log(pk);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
