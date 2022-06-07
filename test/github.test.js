import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import { ERROR_CODES } from "../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "TEST_BRANCH__QUOCBAO";
const NOT_EXIST_BRANCH = "iiiiii_aaaaaa";

const TEST_FILE_NAME = "my_file_for_testing.json";
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

    describe("File manipulation", () => {
        it("it should create a new branch for testing and return its info", async () => {
            const data = await GithubProxy.checkoutNewBranch(TEST_BRANCH);

            expect(data)
                .to.have.property("ref")
                .equal(`refs/heads/${TEST_BRANCH}`);
            expect(data).to.have.property("url");
            expect(data).to.have.property("object");
        });

        it("it should return false as the file not exist", async () => {
            const isExist = await GithubProxy.isExistedFile(
                TEST_FILE_NAME,
                TEST_BRANCH
            );
            expect(isExist).equal(false);
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

        it("it should return an 'not existed' error as the file not exist", async () => {
            try {
                await GithubProxy.updateFile(
                    NOT_EXIST_FILE_NAME,
                    UPDATE_EXAMPLE_DATA,
                    TEST_BRANCH,
                    COMMIT_MESSAGES[1]
                );
            } catch (err) {
                expect(err).equal(ERROR_CODES.FILE_NOT_EXISTED);
            }
        });
    });
});
