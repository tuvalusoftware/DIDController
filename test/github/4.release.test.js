import chai from "chai";

import GithubProxyConfig from "../../db/github/index.js";
import { MAIN_TEST_BRANCH } from "./constant.js";
import { containAllElement, haveCommonElement } from "../../utils/index.js";
import { ERROR_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let expect = chai.expect;

const RELEASE1 = {
    name: `v0.0.test.${Date.now()}`,
    message: "Release test 1",
    commit: "Save a file",
};

const RELEASE2 = {
    name: `v0.0.test.${Date.now()}.2`,
    message: "Release test 2",
    commit: "Update a file",
};

const INVALID_TAG = {
    name: "invalid  name  @",
    message: "This tag name is invalid",
};

const INVALID_SHA = "This is an invalid SHA ?!!";

const FILE = {
    name: "test_file_tag.json",
    content: {
        date: Date.now(),
        value: "Some data from Quoc Bao",
    },
};

describe("GITHUB INTERACTION --- Release", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);

        try {
            await GithubProxy.deleteRelease(RELEASE1.name);
            await GithubProxy.deleteRelease(RELEASE2.name);
        } catch (err) {}
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(MAIN_TEST_BRANCH);

        try {
            await GithubProxy.deleteRelease(RELEASE1.name);
            await GithubProxy.deleteRelease(RELEASE2.name);
        } catch (err) {}
    });

    describe("Tag a commit as release", () => {
        it("it should create a file and tag that commit as a release", async () => {
            await GithubProxy.createBranchIfNotExist(MAIN_TEST_BRANCH);

            const data = await GithubProxy.createNewFile(
                FILE.name,
                FILE.content,
                MAIN_TEST_BRANCH,
                RELEASE1.commit
            );
            expect(data).to.have.property("path").equal(FILE.name);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");

            const { oid: sha } = await GithubProxy.getFileLatestCommit(
                MAIN_TEST_BRANCH,
                FILE.name
            );

            const release = await GithubProxy.tagCommitAsRelease(
                RELEASE1.name,
                RELEASE1.message,
                sha
            );

            expect(release).to.have.property("tag_name").equal(RELEASE1.name);
            expect(release).to.have.property("body").equal(RELEASE1.message);
            expect(release).to.have.property("target_commitish").equal(sha);
        });

        it("it should update a file and tag that commit as a release", async () => {
            const data = await GithubProxy.updateFile(
                FILE.name,
                { ...FILE.content, updated: true },
                MAIN_TEST_BRANCH,
                RELEASE2.commit
            );

            expect(data).to.have.property("path").equal(FILE.name);
            expect(data).to.have.property("sha");
            expect(data).to.have.property("size");

            const { oid: sha } = await GithubProxy.getFileLatestCommit(
                MAIN_TEST_BRANCH,
                FILE.name
            );

            const release = await GithubProxy.tagCommitAsRelease(
                RELEASE2.name,
                RELEASE2.message,
                sha
            );

            expect(release).to.have.property("tag_name").equal(RELEASE2.name);
            expect(release).to.have.property("body").equal(RELEASE2.message);
            expect(release).to.have.property("target_commitish").equal(sha);
        });
    });

    describe("Tag release with invalid params", () => {
        it("it should return an 'already existed' error as a tag with the same name has already existed", async () => {
            try {
                const commitSHA = await GithubProxy.getBranchLastCommitSHA();
                await GithubProxy.tagCommitAsRelease(RELEASE1.name, commitSHA);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_EXISTED);
            }
        });

        it("it should return an 'invalid tag name' error as the provided name is invalid", async () => {
            try {
                const commitSHA = await GithubProxy.getBranchLastCommitSHA();
                await GithubProxy.tagCommitAsRelease(
                    INVALID_TAG.name,
                    INVALID_TAG.message,
                    commitSHA
                );
            } catch (err) {
                expect(err).equal(ERROR_CODES.INVALID_REF_NAME);
            }
        });
    });

    describe("Get releases and their targets", function () {
        before(function (done) {
            setTimeout(function () {
                done();
            }, 2000);
        });

        it("Get all releases should include the new ones", async () => {
            const releases = await GithubProxy.getAllReleases();
            const releaseNames = releases.map((el) => el.tag_name);

            expect(
                containAllElement(releaseNames, [RELEASE1.name, RELEASE2.name])
            ).equal(true);
        });

        it("it should return an 'not found' error as the release with the given name does not exist", async () => {
            const NONE_EXIST_RL_NAME = `NOT__EXIST__RL`;

            try {
                await GithubProxy.getARelease(NONE_EXIST_RL_NAME);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_NOT_EXISTED);
            }
        });

        it("it should get each release along with its commit info successfully ", async () => {
            const release = await GithubProxy.getARelease(RELEASE1.name);
            expect(release).to.have.property("tag_name").equal(RELEASE1.name);
            expect(release).to.have.property("body").equal(RELEASE1.message);
            expect(release).to.have.property("target_commitish");

            const commitSHA = release.target_commitish;
            const { message: commitMsg } = await GithubProxy.get(
                commitSHA,
                "commit"
            );
            expect(commitMsg).equal(RELEASE1.commit);

            const release2 = await GithubProxy.getARelease(RELEASE2.name);
            expect(release2).to.have.property("tag_name").equal(RELEASE2.name);
            expect(release2).to.have.property("body").equal(RELEASE2.message);
            expect(release2).to.have.property("target_commitish");

            const commitSHA2 = release2.target_commitish;
            const { message: commitMsg2 } = await GithubProxy.get(
                commitSHA2,
                "commit"
            );
            expect(commitMsg2).equal(RELEASE2.commit);
        });

        it("it should still get the file via release even tho file is deleted", async () => {
            await GithubProxy.deleteFile(FILE.name, MAIN_TEST_BRANCH);

            const release = await GithubProxy.getARelease(RELEASE1.name);
            expect(release).to.have.property("tag_name").equal(RELEASE1.name);
            expect(release).to.have.property("body").equal(RELEASE1.message);
            expect(release).to.have.property("target_commitish");

            const commitSHA = release.target_commitish;

            const fileInfo = await GithubProxy.getFile(FILE.name, commitSHA);
            expect(fileInfo.text).equal(JSON.stringify(FILE.content));
        });
    });

    describe("Delete release", () => {
        it("it should delete release successfully", async () => {
            await GithubProxy.deleteRelease(RELEASE1.name);
            await GithubProxy.deleteRelease(RELEASE2.name);
        });

        it("it should return an 'not found' error as release was deleted", async () => {
            try {
                await GithubProxy.getARelease(RELEASE1.name);
            } catch (err) {
                expect(err).equal(ERROR_CODES.REF_NOT_EXISTED);
            }
        });

        it("No release with the same name should be found when get all releases", async () => {
            const releases = await GithubProxy.getAllReleases();
            const releaseNames = releases.map((el) => el.tag_name);

            expect(
                haveCommonElement(releaseNames, [RELEASE1.name, RELEASE2.name])
            ).equal(false);
        });
    });
});
