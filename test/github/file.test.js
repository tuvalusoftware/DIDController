import chai from "chai";

import GithubProxy from "../../db/github/index.js";
import { haveCommonElement, containAllElement } from "../../db/github/utils.js";
import { MAIN_TEST_BRANCH, COMMIT_MESSAGES } from "./constant.js";
import { ERROR_CODES } from "../../constants/index.js";

let expect = chai.expect;

const TEST_FILE_NAME = "file_name_for_testing.json";
const TEST_FILE_NAME2 = "file_name_for_testing2.json";
const TEST_FILES = [
    "file_name_for_testing100.json",
    "file_name_for_testing200.json",
    "file_name_for_testing300.json",
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

let fileCommits = [];

describe("GITHUB INTERACTION --- File && Commits", function () {
    this.timeout(10000);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);
    });

    describe("Create and Read file", () => {
        it("it should create new files on a branch in github and return its path, github id and size", async () => {
            await GithubProxy.checkoutNewBranch(MAIN_TEST_BRANCH);

            const data = await GithubProxy.createNewFile(
                TEST_FILE_NAME,
                EXAMPLE_DATA,
                MAIN_TEST_BRANCH,
                COMMIT_MESSAGES[0]
            );

            expect(data).to.have.property("path").equal(TEST_FILE_NAME);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");
            fileCommits.push(COMMIT_MESSAGES[0]);

            const data2 = await GithubProxy.createNewFile(
                TEST_FILE_NAME2,
                EXAMPLE_DATA,
                MAIN_TEST_BRANCH,
                COMMIT_MESSAGES[1]
            );
            expect(data2).to.have.property("path").equal(TEST_FILE_NAME2);
            expect(data2).to.have.property("sha");
            expect(data2).to.have.property("size");
        });

        it("it should return an 'already existed' error as the file with the same name has already existed", async () => {
            try {
                await GithubProxy.createNewFile(
                    TEST_FILE_NAME,
                    EXAMPLE_DATA,
                    MAIN_TEST_BRANCH,
                    COMMIT_MESSAGES[0]
                );
            } catch (err) {
                expect(err).equal(ERROR_CODES.FILE_EXISTED);
            }
        });

        it("it should get each file with the same content", async () => {
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                MAIN_TEST_BRANCH
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

            const data2 = await GithubProxy.getFile(
                TEST_FILE_NAME2,
                lastCommitOfBranch
            );
            expect(data2)
                .to.have.property("text")
                .equal(JSON.stringify(EXAMPLE_DATA));
            expect(data2).to.have.property("oid");
            expect(data2).to.have.property("text");
        });

        it("it should get an array of files contains the files info", async () => {
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                MAIN_TEST_BRANCH
            );
            const files = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );

            expect(files).to.be.an("array");
            const fileNames = files.map((el) => el.name);
            expect(
                containAllElement(fileNames, [TEST_FILE_NAME, TEST_FILE_NAME2])
            ).equal(true);
        });
    });

    describe("Update and Read file", () => {
        it("it should update a file on a branch and return its path, github id and size", async () => {
            const data = await GithubProxy.updateFile(
                TEST_FILE_NAME,
                UPDATE_EXAMPLE_DATA,
                MAIN_TEST_BRANCH,
                COMMIT_MESSAGES[2]
            );

            expect(data).to.have.property("path").equal(TEST_FILE_NAME);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");
            fileCommits.push(COMMIT_MESSAGES[2]);
        });

        it("it should get a file with the updated content", async () => {
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                MAIN_TEST_BRANCH
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

        it("it should return an 'not found' error as the file with the same name does not exist", async () => {
            try {
                await GithubProxy.updateFile(
                    NOT_EXIST_FILE_NAME,
                    EXAMPLE_DATA,
                    MAIN_TEST_BRANCH,
                    COMMIT_MESSAGES[1]
                );
            } catch (err) {
                expect(err).equal(ERROR_CODES.FILE_NOT_EXISTED);
            }
        });
    });

    describe("Check for existing file", () => {
        it("it should return 'true' as file exist", async () => {
            const isExist = await GithubProxy.isExistedFile(
                TEST_FILE_NAME,
                MAIN_TEST_BRANCH
            );
            expect(isExist).equal(true);
        });

        it("it should return 'false' as file dose not exist", async () => {
            const isExist = await GithubProxy.isExistedFile(
                NOT_EXIST_FILE_NAME,
                MAIN_TEST_BRANCH
            );
            expect(isExist).equal(false);
        });
    });

    describe("Save multiple files at the same time to the same branch", () => {
        it("it should return an error state that there are a github conflict", async () => {
            try {
                const saves = TEST_FILES.map((name) =>
                    GithubProxy.createNewFile(
                        name,
                        EXAMPLE_DATA,
                        MAIN_TEST_BRANCH,
                        COMMIT_MESSAGES[3]
                    )
                );

                await Promise.all(saves);
            } catch (err) {
                expect(err).equal(ERROR_CODES.CONFLICT_PUSH);
            }
        });

        it("it should saved at least 1 file to the github", async () => {
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                MAIN_TEST_BRANCH
            );
            const files = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );
            const fileNames = files.map((el) => el.name);

            expect(haveCommonElement(fileNames, TEST_FILES)).equal(true);
        });
    });

    describe("Delete a file", () => {
        it("it should delete a file", async () => {
            await GithubProxy.deleteFile(
                TEST_FILE_NAME,
                MAIN_TEST_BRANCH,
                COMMIT_MESSAGES[4]
            );
            fileCommits.push(COMMIT_MESSAGES[4]);
        });

        it("it should have no file with same name on github", async () => {
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                MAIN_TEST_BRANCH
            );
            const files = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );
            const fileNames = files.map((el) => el.name);
            expect(fileNames.includes(TEST_FILE_NAME)).equal(false);
        });
    });

    describe("Check for commit history of a branch", () => {
        it("it should return the commit history of a branch in newest to oldest order", async () => {
            const data = await GithubProxy.getCommitHistory(
                5,
                MAIN_TEST_BRANCH
            );

            expect(data.length).equal(5);
            const commitMessages = data.map((el) => el.message);
            const inOrderCommitMsgs = JSON.parse(
                JSON.stringify(COMMIT_MESSAGES)
            ).reverse();

            expect(JSON.stringify(commitMessages)).equal(
                JSON.stringify(inOrderCommitMsgs)
            );
        });

        it("it should return the commit history of a file", async () => {
            const data = await GithubProxy.getCommitHistory(
                100,
                MAIN_TEST_BRANCH,
                TEST_FILE_NAME
            );

            expect(data.length).equal(3);
            const commitMessages = data.map((el) => el.message);

            expect(JSON.stringify(commitMessages)).equal(
                JSON.stringify(fileCommits.reverse())
            );
        });
    });
});
