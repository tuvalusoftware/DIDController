import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import { isExistsKey } from "../db/github/utils.js";
import { ERROR_CODES } from "../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const NEW_BRANCH = "new_branch";

describe("Github API interaction", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(NEW_BRANCH);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(NEW_BRANCH);
    });

    describe("Interact with Github branch", function () {
        // Check if doc with the same name exist
        it(`New branch named ${NEW_BRANCH} should be created`, async function (done) {
            const newBranch = await GithubProxy.checkoutNewBranch(
                NEW_BRANCH,
                "empty_branch"
            );

            expect(newBranch.ref.includes(NEW_BRANCH)).equal(true);
            done();
        });
    });
});
