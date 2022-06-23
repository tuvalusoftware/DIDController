import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../db/github/index.js";
import server from "../server.js";
import { SUCCESS_CODES, ERROR_CODES } from "../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "MOCHA__TESTING__CREDENTIAL";
const TEST_PUBLICKEY = "123456adbcd";
const TEST_DATA = {
    companyName: TEST_BRANCH,
    publicKey: TEST_PUBLICKEY,
    content: {
        controller: "123456adbcd",
        id: "did:some_string:company:123456adbcd",
    },
};
const CREDENTIAL_DATA = {
    issuer: TEST_PUBLICKEY,
    subject: "other_public_key",
    credentialSubject: {
        object: "an_wrapped_doc_did",
        action: { code: 3000, value: "changeOwnerShip" },
    },
    signature: "12345678986543234567qwertytwq231234567876543sdfghgfds",
    metadata: {
        dateCreated: "22/06/2022",
        some_fields: "some_data",
    },
};

const CREDENTIAL_DATA2 = {
    issuer: TEST_PUBLICKEY,
    subject: "other_public_key2",
    credentialSubject: {
        object: "an_wrapped_doc_did",
        action: { code: 3000, value: "changeHolderShip" },
    },
    signature: "12345678986543234567qwertytwq231234567876543sdfghgfds",
    metadata: {
        dateCreated: "22/06/2022",
        some_fields: "some_data",
    },
};

const INVALID_CREDENTIAL = {
    invalid_props: "Some string",
};

describe("CREDENTIAL", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    describe("/POST create new credential", () => {
        it("it should create a new DID and return a success message", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    res.body.message.should.equal(SUCCESS_CODES.SAVE_SUCCESS);
                    done();
                });
        });

        it("it should create a credential and return a success message - 1st credential", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: TEST_PUBLICKEY,
                    companyName: TEST_BRANCH,
                    credential: CREDENTIAL_DATA,
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    res.body.message.should.equal(SUCCESS_CODES.SAVE_SUCCESS);
                    done();
                });
        });

        it("it should create a credential and return a success message - 2nd credential", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: TEST_PUBLICKEY,
                    companyName: TEST_BRANCH,
                    credential: CREDENTIAL_DATA2,
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    res.body.message.should.equal(SUCCESS_CODES.SAVE_SUCCESS);
                    done();
                });
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: TEST_PUBLICKEY,
                    companyName: TEST_BRANCH,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return an 'invalid credential' error as the content of the credential is invalid", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: TEST_PUBLICKEY,
                    companyName: TEST_BRANCH,
                    credential: INVALID_CREDENTIAL,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.CREDENTIAL_CONTENT_INVALID)
                    );

                    done();
                });
        });

        it("it should return a 'not found' error as the public key is invalid", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: "invalid_public_key",
                    companyName: TEST_BRANCH,
                    credential: CREDENTIAL_DATA2,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a 'not found' error as the company name is invalid", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({
                    publicKey: TEST_PUBLICKEY,
                    companyName: "invalid_branch",
                    credential: CREDENTIAL_DATA2,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });
    });

    describe("/GET get credentials of an user", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/credential")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'not found' error as the public key is invalid", (done) => {
            chai.request(server)
                .get("/api/credential")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", "invalid_public_key")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a 'not found' error as the company name is invalid", (done) => {
            chai.request(server)
                .get("/api/credential")
                .set("companyName", "invalid_branch")
                .set("publicKey", TEST_PUBLICKEY)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a an array of credentials", (done) => {
            chai.request(server)
                .get("/api/credential")
                .set("companyName", TEST_BRANCH)
                .set("publicKey", TEST_PUBLICKEY)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.eql(2);

                    const savedCredentials = [
                        CREDENTIAL_DATA,
                        CREDENTIAL_DATA2,
                    ];

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(savedCredentials)
                    );

                    done();
                });
        });
    });
});
