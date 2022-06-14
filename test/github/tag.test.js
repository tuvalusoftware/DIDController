import chai from "chai";

import GithubProxy from "../../db/github/index.js";
import { MAIN_TEST_BRANCH } from "./constant.js";
import { containAllElement, haveCommonElement } from "../../db/github/utils.js";
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
const TAG2 = {
    name: "my_tag2",
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
            await GithubProxy.deleteATag(TAG2.name);
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

        it("it should update a file and tag that commit", async () => {
            const data = await GithubProxy.updateFile(
                FILE.name,
                { ...FILE.content, updated: true },
                MAIN_TEST_BRANCH,
                COMMIT_MESSAGE
            );

            expect(data).to.have.property("path").equal(FILE.name);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");

            const { oid: sha } = await GithubProxy.getLatestCommit(
                MAIN_TEST_BRANCH,
                FILE.name
            );

            const tag = await GithubProxy.tag(TAG2.name, sha);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG2.name}`);
            expect(tag)
                .to.have.property("object")
                .to.have.property("sha")
                .equal(sha);
        });
    });

    describe("Tag with invalid params", () => {
        it("it should return an 'already existed' error as a tag with the same name has already existed", async () => {
            try {
                const commitSHA = await GithubProxy.getBranchLastCommitSHA();
                await GithubProxy.tag(TAG1.name, commitSHA);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_EXISTED);
            }
        });

        it("it should return an 'invalid tag name' error as the provided name is invalid", async () => {
            try {
                const commitSHA = await GithubProxy.getBranchLastCommitSHA();
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

    describe("Get tags and their targets", () => {
        it("Get all tags should include the new tags", async () => {
            const tags = await GithubProxy.getAllTags();
            const tagNames = tags.map((el) => el.name);

            expect(containAllElement(tagNames, [TAG1.name, TAG2.name])).equal(
                true
            );
        });

        it("it should get a tag successfully and its file", async () => {
            const tag = await GithubProxy.getATag(TAG1.name);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG1.name}`);
            expect(tag).to.have.property("object").to.have.property("sha");

            const gitObjectId = tag.object.sha;
            const file = await GithubProxy.get(gitObjectId, "blob");
            const { content } = file;
            let buff = Buffer.from(content, "base64");
            let contentString = buff.toString("ascii");
            expect(contentString).equal(JSON.stringify(FILE.content));
        });

        it("it should get a tag successfully and its commit info", async () => {
            const tag = await GithubProxy.getATag(TAG2.name);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG2.name}`);
            expect(tag).to.have.property("object").to.have.property("sha");

            const gitObjectId = tag.object.sha;
            const { message: commitMsg } = await GithubProxy.get(
                gitObjectId,
                "commit"
            );
            expect(commitMsg).equal(COMMIT_MESSAGE);
        });

        it("it should still get the file via tag even tho file is deleted", async () => {
            await GithubProxy.deleteFile(FILE.name, MAIN_TEST_BRANCH);

            const tag = await GithubProxy.getATag(TAG2.name);
            expect(tag).to.have.property("ref").equal(`refs/tags/${TAG2.name}`);
            expect(tag).to.have.property("object").to.have.property("sha");

            const commitId = tag.object.sha;

            const fileInfo = await GithubProxy.getFile(FILE.name, commitId);
            expect(fileInfo.text).equal(
                JSON.stringify({ ...FILE.content, updated: true })
            );
        });
    });

    describe("Delete tags", () => {
        it("it should delete tag successfully", async () => {
            await GithubProxy.deleteATag(TAG1.name);
            await GithubProxy.deleteATag(TAG2.name);
        });

        it("it should return an 'not found' error as tag was deleted", async () => {
            try {
                await GithubProxy.getATag(TAG1.name);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_NOT_EXISTED);
            }
        });

        it("No tag with the same name should be found when get all tags", async () => {
            const tags = await GithubProxy.getAllTags();
            const tagNames = tags.map((el) => el.name);

            expect(haveCommonElement(tagNames, [TAG1.name, TAG2.name])).equal(
                false
            );
        });
    });
});
