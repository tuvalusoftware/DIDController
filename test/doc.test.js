import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import server from "../server.js";

let should = chai.should();
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
});
