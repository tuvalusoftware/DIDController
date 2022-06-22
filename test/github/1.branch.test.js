import chai from "chai";

import GithubProxy from "../../db/github/index.js";
import { containAllElement } from "../../utils/index.js";
import { MAIN_TEST_BRANCH } from "./constant.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

let expect = chai.expect;

const TEST_BRANCHES = [
    "TEST_BRANCH__QUOCBAO1",
    "TEST_BRANCH__QUOCBAO2",
    "TEST_BRANCH__QUOCBAO3",
];
const ALL_TEST_BRANCHES = [...TEST_BRANCHES, MAIN_TEST_BRANCH];
const NOT_EXIST_BRANCH = "iiiiii_aaaaaa";

const deleteAllTestBranches = async () => {
    const branches = await GithubProxy.getAllBranches();
    const branchNames = branches.map((el) => el.name);

    for (let br of ALL_TEST_BRANCHES) {
        if (branchNames.includes(br)) {
            await GithubProxy.deleteBranch(br);
        }
    }
};

describe("GITHUB INTERACTION --- Branch", function () {
    this.timeout(10000);

    before(async () => {
        await deleteAllTestBranches();
    });

    after(async () => {
        await deleteAllTestBranches();
    });

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
            const data = await GithubProxy.checkoutNewBranch(MAIN_TEST_BRANCH);

            expect(data).to.have.property("name").equal(MAIN_TEST_BRANCH);
            expect(data).to.have.property("commit");
        });

        it("it should return an array with all branches including the newly created branch", async () => {
            const data = await GithubProxy.getAllBranches();
            expect(data).to.be.an("array").to.have.length.greaterThan(2);

            const names = data.map((el) => el.name);
            expect(names.includes(MAIN_TEST_BRANCH)).equal(true);
        });

        it("it should return an 'already existed' error as the branch with the same name has already existed", async () => {
            try {
                await GithubProxy.checkoutNewBranch(MAIN_TEST_BRANCH);
            } catch (err) {
                expect(err).equal(ERROR_CODES.BRANCH_EXISTED);
            }
        });
    });

    describe("Delete branch", () => {
        it("it should return 'true' as branch is successfully deleted", async () => {
            const response = await GithubProxy.deleteBranch(MAIN_TEST_BRANCH);
            expect(response).equal(SUCCESS_CODES.DELETE_SUCCESS);
        });

        it("it should return an array with all branches without the deleted branch", async () => {
            const data = await GithubProxy.getAllBranches();
            expect(data).to.be.an("array").to.have.length.greaterThan(2);

            const names = data.map((el) => el.name);
            expect(names.includes(MAIN_TEST_BRANCH)).equal(false);
        });
    });

    describe("Create multiple branches at the same time", () => {
        it("it should create all test branches", async () => {
            const saves = TEST_BRANCHES.map((name) =>
                GithubProxy.checkoutNewBranch(name)
            );

            await Promise.all(saves);
            const branches = await GithubProxy.getAllBranches();
            const branchesName = branches.map((el) => el.name);
            expect(containAllElement(branchesName, TEST_BRANCHES)).equal(true);
        });
    });
});
