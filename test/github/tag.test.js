import chai from "chai";

import GithubProxy from "../../db/github/index.js";
import { MAIN_TEST_BRANCH } from "./constant.js";
import { ERROR_CODES } from "../../constants/index.js";

let expect = chai.expect;

const FILE = {
    name: "test_file_tag.json",
    content: {
        date: Date.now(),
        value: "Some data from Quoc Bao",
    },
};

const TAG1 = {
    name: "my_tag1",
};

const INVALID_TAG = {
    name: "123 Quoc Bao",
};

const INVALID_SHA = "123QuocBao456";

const COMMIT_MESSAGE = "This commit has been tag";

describe("GITHUB INTERACTION --- Tag", function () {
    this.timeout(10000);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);

        try {
            await GithubProxy.deleteATag(TAG1.name);
        } catch (err) {}
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);
    });

    describe("Tag a file and a commit", () => {
        it("it should create a file and tag that file", async () => {
            await GithubProxy.createBranchIfNotExist(MAIN_TEST_BRANCH);

            const data = await GithubProxy.createNewFile(
                FILE.name,
                FILE.content,
                MAIN_TEST_BRANCH,
                "Commit"
            );
            expect(data).to.have.property("path").equal(FILE.name);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");

            const tag = await GithubProxy.tag(TAG1.name, data.sha);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG1.name}`);
            expect(tag)
                .to.have.property("object")
                .to.have.property("sha")
                .equal(data.sha);
        });
    });

    describe("Tag something invalidly", () => {
        it("it should return an 'already existed' error as a tag with the same name has already existed", async () => {
            try {
                const commitSHA = await GithubProxy.getLastCommitSHA();
                await GithubProxy.tag(TAG1.name, commitSHA);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_EXISTED);
            }
        });

        it("it should return an 'invalid tag name' error as the provided name is invalid", async () => {
            try {
                const commitSHA = await GithubProxy.getLastCommitSHA();
                await GithubProxy.tag(INVALID_TAG.name, commitSHA);
            } catch (err) {
                expect(err).equal(ERROR_CODES.INVALID_REF_NAME);
            }
        });

        it("it should return an 'invalid git object id' error as the provided SHA is invalid", async () => {
            try {
                await GithubProxy.tag(INVALID_TAG.name, INVALID_SHA);
            } catch (err) {
                expect(err).equal(ERROR_CODES.INVALID_GIT_OBJECT_ID);
            }
        });
    });

    describe("Get a tag and its file", () => {
        it("Get all tags should include the new tag", async () => {
            const tags = await GithubProxy.getAllTags();
            const tagNames = tags.map((el) => el.name);

            expect(tagNames.includes(TAG1.name)).equal(true);
        });

        it("it should get a tag successfully and its file", async () => {
            const tag = await GithubProxy.getATag(TAG1.name);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG1.name}`);
            expect(tag).to.have.property("object").to.have.property("sha");

            const gitObjectId = tag.object.sha;
            const file = await GithubProxy.get(gitObjectId);
            const { content } = file;
            let buff = Buffer.from(content, "base64");
            let contentString = buff.toString("ascii");
            expect(contentString).equal(JSON.stringify(FILE.content));
        });
    });
});
