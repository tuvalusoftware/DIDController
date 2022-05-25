import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import server from "../server.js";

let should = chai.should();
chai.use(chaiHttp);

const TEST_BRANCH = "MOCHA_TESTING";
const TEST_DATA = {
    companyName: TEST_BRANCH,
    publicKey: "public_key",
    content: {
        date: "10-10-2000",
        issuer: "123123abcd",
    },
};
const TEST_DATA2 = {
    companyName: TEST_BRANCH,
    publicKey: "public_key_2",
    content: {
        date: "10-10-2000",
        issuer: "123123abcd",
    },
};
const UPDATED_DATA = {
    companyName: TEST_BRANCH,
    publicKey: "public_key_2",
    content: {
        date: "10-10-2000",
        issuer: "123123abcd",
        updated: true,
    },
};

describe("DID", function () {
    this.timeout(10000);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    describe("/POST create new DID", () => {
        // Create new DID
        it("it should return a success message", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    done();
                });
        });

        // Save DID with the same Public Key
        it("it should return an 'already exist' message", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("errorMessage")
                        .eql("File with the given name already exist.");

                    done();
                });
        });

        // Create new DID
        it("it should return a success message", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA2)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    done();
                });
        });
    });

    describe("/GET get did", () => {
        // Get a single DID
        it("it should GET a DID", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("content");
                    res.body.should.have
                        .property("name")
                        .eql(TEST_DATA.publicKey);

                    done();
                });
        });

        // Get all DID
        it("it should GET an array of DID from a company", (done) => {
            chai.request(server)
                .get("/api/did/all")
                .set("companyName", TEST_BRANCH)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(2);

                    done();
                });
        });
    });

    describe("/PUT update data of a did", () => {
        it("it should update the existed DID return a success message", (done) => {
            chai.request(server)
                .put("/api/did")
                .send(UPDATED_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    done();
                });
        });

        // Get a single DID
        it("it should GET the updated DID", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA2.companyName)
                .set("publicKey", TEST_DATA2.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("content");
                    res.body.should.have
                        .property("name")
                        .eql(TEST_DATA2.publicKey);

                    res.body.content.should.have.property("updated").eql(true);

                    if (err) console.log(err);
                    done();
                });
        });
    });

    describe("/DELETE delete a DID", () => {
        it("it should delete the existed DID return a success message", (done) => {
            chai.request(server)
                .delete("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    done();
                });
        });

        // Get all DID
        it("it should GET an array with length 1", (done) => {
            chai.request(server)
                .get("/api/did/all")
                .set("companyName", TEST_BRANCH)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);

                    done();
                });
        });
    });
});
