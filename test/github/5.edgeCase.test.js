import chai from "chai";

import GithubProxyConfig from "../../db/github/index.js";
import { containAllElement } from "../../utils/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let expect = chai.expect;

const TEST_BRANCHES = [
    "TEST_BRANCH__QUOCBAO4",
    "TEST_BRANCH__QUOCBAO5",
    "TEST_BRANCH__QUOCBAO6",
];

const FILE = {
    name: "my_test_file.json",
    content: {
        value: "This is a important string",
        date: "10/10/2022",
        expired: false,
    },
};

const deleteAllTestBranches = async () => {
    const branches = await GithubProxy.getAllBranches();
    const branchNames = branches.map((el) => el.name);

    for (let br of TEST_BRANCHES) {
        if (branchNames.includes(br)) {
            await GithubProxy.deleteBranch(br);
        }
    }
};

const saveFileToBranch = async (branchName) => {
    await GithubProxy.createBranchIfNotExist(branchName);
    await GithubProxy.createNewFile(FILE.name, FILE.content, branchName);
};

const getFile = async (branchName) => {
    const lastCommitOfBranch = await GithubProxy.getBranchLastCommitSHA(
        branchName
    );

    const data = await GithubProxy.getFile(FILE.name, lastCommitOfBranch);
    return data;
};

describe("GITHUB INTERACTION --- Other edge cases", function () {
    this.timeout(10000);

    before(async () => {
        await deleteAllTestBranches();
    });

    after(async () => {
        await deleteAllTestBranches();
    });

    describe("Save multiple files to multiple branches at the same time", () => {
        it("it should create and save all files and branches successfully", async () => {
            const operations = TEST_BRANCHES.map((el) => saveFileToBranch(el));
            await Promise.all(operations);
        });

        it("it should create all the new branches", async () => {
            const branches = await GithubProxy.getAllBranches();
            const branchesName = branches.map((el) => el.name);
            expect(containAllElement(branchesName, TEST_BRANCHES)).equal(true);
        });

        it("it should say that all new files exist", async () => {
            const operations = TEST_BRANCHES.map((branchName) =>
                GithubProxy.isExistedFile(FILE.name, branchName)
            );
            const [exist1, exist2, exist3] = await Promise.all(operations);

            const allExist = [exist1, exist2, exist3].every(
                (el) => el === true
            );

            expect(allExist).equal(true);
        });

        it("it should get all files and its content", async () => {
            const operations = TEST_BRANCHES.map((el) => getFile(el));
            const [data1, data2, data3] = await Promise.all(operations);

            const allCorrectData = [data1, data2, data3].every(
                (data) => data.text === JSON.stringify(FILE.content)
            );

            expect(allCorrectData).equal(true);
        });
    });
});
