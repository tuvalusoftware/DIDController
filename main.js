import GithubDB from "./github_db/index.js";

const main = async () => {
    try {
        // const data = await GithubDB.checkoutNewBranch("new_branch2");
        // console.log(data);
        // const data1 = { data: "This is branch main" };
        // GithubDB.createNewFile("branch_main.json", data1);
        // const data2 = { data: "This is not branch main" };
        // GithubDB.createNewFile("not_main.json", data2, "new_branch2");
        // await GithubDB.deleteBranch("new_branch2");
        // const data = await GithubDB.getFilesOfTree("", false);
        // const files = data.map((file) => file.name);
        // for (let file of files) {
        //     await GithubDB.deleteFile(
        //         file,
        //         "main",
        //         `This is delete message: ${file}`
        //     );
        // }
        // const data = await GithubDB.createIfNotExist("asdfasdf");
        // console.log(data);
        // await GithubDB.deleteBranch("asdfasdf");
        // console.log("DB");
        // const data = { data: "Xin chao" };
        // GithubDB.createNewFile("test500.json", data).catch((err) =>
        //     console.log("ERROR from MAIN.JS: ", err)
        // );
        // GithubDB.createNewFile("test600.json", data).catch((err) =>
        //     console.log("ERROR from MAIN.JS: ", err)
        // );

        // const data = await GithubDB.getAllBranches();
        // console.log(data);

        const data = await GithubDB.getATag("v0.0.0.1");
        console.log(data);
    } catch (err) {
        console.log("ERROR from MAIN.JS: ", err);
    }
};

main();
