import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import server from "../server.js";
import { ERROR_CODES } from "../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "MOCHA_TESTING";
const TEST_DATA = {
    wrappedDocument: {
        version: "https://schema.openattestation.com/2.0/schema.json",
        data: {
            name: "UUIDV4:string:...",
            issuers: [
                {
                    identityProof: {
                        type: "UUIDV4:string:DID",
                        location: "UUIDV4:string:fuixlabs.com",
                    },
                    did: "UUIDV4:string:....",
                    tokenRegistry: "UUIDV4:string:...",
                    address:
                        "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur",
                },
            ],
        },
        signature: {
            type: "SHA3MerkleProof",
            targetHash:
                "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
            proof: [],
            merkleRoot:
                "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
        },
    },
    companyName: TEST_BRANCH,
    fileName: "file_name",
};

const EMPTY_DATA = {};

describe("DOC", function () {
    this.timeout(10000);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(`DOC_${TEST_BRANCH}`);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(`DOC_${TEST_BRANCH}`);
    });

    describe("/POST create new document", () => {
        // Check if doc with the same name exist
        it("it should return 'false' because file not create", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("isExisted").eql(false);

                    done();
                });
        });

        // Create new DOC with invalid data
        it("it should return a error message as the post data is invalid", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send(EMPTY_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        // Create new DOC
        it("it should return a success message", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    done();
                });
        });

        // Check if doc with the same name exist
        it("it should return 'true'", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("isExisted").eql(true);

                    done();
                });
        });
    });

    describe("/GET fetch document", () => {
        it("it should return 'true' because file had been created", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("isExisted").eql(true);

                    done();
                });
        });

        it("it should GET both the wrapped document and the did doc of the document", (done) => {
            chai.request(server)
                .get("/api/doc")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("wrappedDoc")
                        .eql(TEST_DATA.wrappedDocument);

                    res.body.should.have.property("didDoc");
                    res.body.didDoc.should.have.property("controller");
                    res.body.didDoc.should.have.property("docController");
                    res.body.didDoc.should.have
                        .property("url")
                        .eql(`${TEST_DATA.fileName}.document`);
                    res.body.didDoc.should.have.property("did");

                    done();
                });
        });

        it("it should GET only the wrapped document as the flag indicates to exclude the did doc", (done) => {
            chai.request(server)
                .get("/api/doc?exclude=did")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("wrappedDoc")
                        .eql(TEST_DATA.wrappedDocument);

                    done();
                });
        });

        it("it should GET only the did document of the wrapped document as the flag indicates to exclude the wrapped document", (done) => {
            chai.request(server)
                .get("/api/doc?exclude=doc")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    res.body.should.have.property("didDoc");
                    res.body.didDoc.should.have.property("controller");
                    res.body.didDoc.should.have.property("docController");
                    res.body.didDoc.should.have
                        .property("url")
                        .eql(`${TEST_DATA.fileName}.document`);
                    res.body.didDoc.should.have.property("did");

                    done();
                });
        });
    });
});
