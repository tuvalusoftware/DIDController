import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import { containAllElement, haveCommonElement } from "../db/github/utils.js";
import { ERROR_CODES } from "../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "TEST_BRANCH__QUOCBAO";
const TEST_BRANCHES = [
    "TEST_BRANCH__QUOCBAO1",
    "TEST_BRANCH__QUOCBAO2",
    "TEST_BRANCH__QUOCBAO3",
];
const NOT_EXIST_BRANCH = "iiiiii_aaaaaa";

const TEST_FILE_NAME = "my_file_for_testing.json";
const TEST_FILES = [
    "my_file_for_testing2.json",
    "my_file_for_testing3.json",
    "my_file_for_testing4.json",
];
const NOT_EXIST_FILE_NAME = "not_existed_file_for_testing.json";
const EXAMPLE_DATA = {
    name: "Quoc Bao",
    age: 22,
    job: "Software Dev",
};
const UPDATE_EXAMPLE_DATA = {
    ...EXAMPLE_DATA,
    description: "Working for Fuixlab company",
};
const COMMIT_MESSAGES = ["Commit 1", "Commit 2", "Commit 3"];

describe("Github Interaction", function () {
    this.timeout(10000);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(TEST_BRANCH);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(TEST_BRANCH);
    });

    describe("Branch manipulation", () => {
        describe("Read Branches", () => {
            it("it should return an array with all branches (include 'main' && 'empty_branch')", async () => {
                const data = await GithubProxy.getAllBranches();
                expect(data).to.be.an("array").to.have.length.greaterThan(2);

                const names = data.map((el) => el.name);
                expect(names.includes("main")).equal(true);
                expect(names.includes("empty_branch")).equal(true);
            });

            it("it should return info of branch 'main'", async () => {
                const data = await GithubProxy.getBranchInfo();
                expect(data).to.have.property("name").equal("main");
                expect(data).to.have.property("commit");
            });

            it("it should return an 'not existed' error as the branch not exist", async () => {
                try {
                    await GithubProxy.getBranchInfo(NOT_EXIST_BRANCH);
                } catch (err) {
                    expect(err).equal(ERROR_CODES.BRANCH_NOT_EXISTED);
                }
            });
        });

        describe("Create branch", () => {
            it("it should create a new branch and return its info", async () => {
                const data = await GithubProxy.checkoutNewBranch(TEST_BRANCH);

                expect(data)
                    .to.have.property("ref")
                    .equal(`refs/heads/${TEST_BRANCH}`);
                expect(data).to.have.property("url");
                expect(data).to.have.property("object");
            });

            it("it should return an array with all branches including the newly created branch", async () => {
                const data = await GithubProxy.getAllBranches();
                expect(data).to.be.an("array").to.have.length.greaterThan(2);

                const names = data.map((el) => el.name);
                expect(names.includes(TEST_BRANCH)).equal(true);
            });

            it("it should return an 'already existed' error as the branch with the same name has already existed", async () => {
                try {
                    await GithubProxy.checkoutNewBranch(TEST_BRANCH);
                } catch (err) {
                    expect(err).equal(ERROR_CODES.BRANCH_EXISTED);
                }
            });
        });

        describe("Delete branch", () => {
            it("it should return 'true' as branch is successfully deleted", async () => {
                const isSuccess = await GithubProxy.deleteBranch(TEST_BRANCH);
                expect(isSuccess).equal(true);
            });

            it("it should return an array with all branches without the deleted branch", async () => {
                const data = await GithubProxy.getAllBranches();
                expect(data).to.be.an("array").to.have.length.greaterThan(2);

                const names = data.map((el) => el.name);
                expect(names.includes(TEST_BRANCH)).equal(false);
            });
        });

        describe("Create 2 branches at the same time", () => {
            it("it should create all test branches", async () => {
                const saves = TEST_BRANCHES.map((name) =>
                    GithubProxy.checkoutNewBranch(name)
                );

                await Promise.all(saves);
                const branches = await GithubProxy.getAllBranches();
                const branchesName = branches.map((el) => el.name);
                expect(containAllElement(branchesName, TEST_BRANCHES)).equal(
                    true
                );

                for (let branch of TEST_BRANCHES) {
                    await GithubProxy.deleteBranchIfExist(branch);
                }
            });
        });
    });

    describe("File manipulation", () => {
        describe("Create and Read file", () => {
            it("it should create a new branch for testing and return its info", async () => {
                const data = await GithubProxy.checkoutNewBranch(TEST_BRANCH);

                expect(data)
                    .to.have.property("ref")
                    .equal(`refs/heads/${TEST_BRANCH}`);
                expect(data).to.have.property("url");
                expect(data).to.have.property("object");
            });

            it("it should create a new file on a branch in github and return its path, github id and size", async () => {
                const data = await GithubProxy.createNewFile(
                    TEST_FILE_NAME,
                    EXAMPLE_DATA,
                    TEST_BRANCH,
                    COMMIT_MESSAGES[0]
                );

                expect(data).to.have.property("path").equal(TEST_FILE_NAME);
                expect(data).to.have.property("sha");
                expect(data).to.have.property("size");
            });

            it("it should get a file with the same content", async () => {
                const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                    TEST_BRANCH
                );
                const data = await GithubProxy.getFile(
                    TEST_FILE_NAME,
                    lastCommitOfBranch
                );

                expect(data)
                    .to.have.property("text")
                    .equal(JSON.stringify(EXAMPLE_DATA));
                expect(data).to.have.property("oid");
                expect(data).to.have.property("text");
            });

            it("it should return an 'already existed' error as the file with the same name has already existed", async () => {
                try {
                    await GithubProxy.createNewFile(
                        TEST_FILE_NAME,
                        EXAMPLE_DATA,
                        TEST_BRANCH,
                        COMMIT_MESSAGES[0]
                    );
                } catch (err) {
                    expect(err).equal(ERROR_CODES.FILE_EXISTED);
                }
            });
        });

        describe("Update and Read file", () => {
            it("it should update a file on a branch and return its path, github id and size", async () => {
                const data = await GithubProxy.updateFile(
                    TEST_FILE_NAME,
                    UPDATE_EXAMPLE_DATA,
                    TEST_BRANCH,
                    COMMIT_MESSAGES[1]
                );

                expect(data).to.have.property("path").equal(TEST_FILE_NAME);
                expect(data).to.have.property("sha");
                expect(data).to.have.property("size");
            });

            it("it should get a file with the updated content", async () => {
                const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                    TEST_BRANCH
                );
                const data = await GithubProxy.getFile(
                    TEST_FILE_NAME,
                    lastCommitOfBranch
                );

                expect(data)
                    .to.have.property("text")
                    .equal(JSON.stringify(UPDATE_EXAMPLE_DATA));
                expect(data).to.have.property("oid");
                expect(data).to.have.property("text");
            });
        });

        describe("Save multiple files at the same time to the same branch", () => {
            it("it should return an error state that there are a github conflict", async () => {
                try {
                    const saves = TEST_FILES.map((name) =>
                        GithubProxy.createNewFile(
                            name,
                            EXAMPLE_DATA,
                            TEST_BRANCH,
                            COMMIT_MESSAGES[2]
                        )
                    );

                    await Promise.all(saves);
                } catch (err) {
                    expect(err).equal(ERROR_CODES.CONFLICT_PUSH);
                }
            });

            it("it should saved at least 1 file to the github", async () => {
                const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                    TEST_BRANCH
                );
                const files = await GithubProxy.getFilesOfTree(
                    "",
                    false,
                    lastCommitOfBranch
                );
                const fileNames = files.map((el) => el.name);

                expect(fileNames.length).equal(2);
                expect(haveCommonElement(fileNames, TEST_FILES)).equal(true);
            });
        });
    });
});
