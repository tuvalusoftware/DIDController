import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxy from "../../db/github/index.js";
import server from "../../server.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "MOCHA_TESTING";
const INVALID_DATA = {
    companyName: TEST_BRANCH,
    publicKey: "public_key_invalid",
    content: {},
};
const INVALID_COMPANY_NAME = "invalid___company___name";
const INVALID_PUBLIC_KEY = "invalid___public___key";
const TEST_DATA = {
    companyName: TEST_BRANCH,
    publicKey: "public_key",
    content: {
        controller: "public_key",
        did: "did:some_string:company:public_key",
        date: "10-10-2000",
    },
};
const TEST_DATA2 = {
    companyName: TEST_BRANCH,
    publicKey: "public_key_2",
    content: {
        controller: "public_key_2",
        did: "did:some_string:company:public_key_2",
        date: "10-10-2022",
    },
};
const UPDATED_DATA = {
    companyName: TEST_BRANCH,
    publicKey: "public_key_2",
    content: {
        controller: "public_key_2",
        did: "did:some_string:company:public_key_2",
        date: "10-10-2000",
        updated: true,
    },
};

describe("DID", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(`DID_${TEST_BRANCH}`);
    });

    describe("/POST create new DID", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is saved successfully", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return an 'already exist' message", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_EXISTED)
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is saved successfully", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(TEST_DATA2)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return an 'invalid content' message as the provided content is invalid", (done) => {
            chai.request(server)
                .post("/api/did")
                .send(INVALID_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.USER_DID_DOC_INVALID)
                    );

                    done();
                });
        });
    });

    describe("/GET get single did", () => {
        it("it should GET a DID", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("content")
                        .eql(TEST_DATA.content);

                    done();
                });
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' cannot be found", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("publicKey", TEST_DATA.publicKey)
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

    describe("/GET get all dids of a company", () => {
        it("it should GET an array of DID from a company", (done) => {
            chai.request(server)
                .get("/api/did/all")
                .set("companyName", TEST_BRANCH)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(2);

                    const nameArr = [TEST_DATA, TEST_DATA2].map(
                        (data) => `${data.publicKey}.did`
                    );
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(nameArr)
                    );

                    done();
                });
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/did/all")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' cannot be found", (done) => {
            chai.request(server)
                .get("/api/did/all")
                .set("companyName", INVALID_COMPANY_NAME)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a 'public key not found' error as the param 'publicKey' is invalid", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", INVALID_PUBLIC_KEY)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });
    });

    describe("/PUT update data of a did", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .put("/api/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .put("/api/did")
                .send({ ...UPDATED_DATA, companyName: INVALID_COMPANY_NAME })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a 'public key not found' error as the param 'publicKey' is invalid", (done) => {
            chai.request(server)
                .put("/api/did")
                .send({ ...UPDATED_DATA, publicKey: INVALID_PUBLIC_KEY })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an 'invalid content' message as the provided content is invalid", (done) => {
            chai.request(server)
                .put("/api/did")
                .send(INVALID_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.USER_DID_DOC_INVALID)
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is updated successfully", (done) => {
            chai.request(server)
                .put("/api/did")
                .send(UPDATED_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.UPDATE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should GET the updated DID", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA2.companyName)
                .set("publicKey", TEST_DATA2.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("content")
                        .eql(UPDATED_DATA.content);
                    res.body.should.have
                        .property("name")
                        .eql(TEST_DATA2.publicKey);

                    done();
                });
        });
    });

    describe("/DELETE delete a DID", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .delete("/api/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' cannot be found", (done) => {
            chai.request(server)
                .delete("/api/did")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a 'public key not found' error as the param 'publicKey' is invalid", (done) => {
            chai.request(server)
                .delete("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", INVALID_PUBLIC_KEY)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is deleted successfully", (done) => {
            chai.request(server)
                .delete("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.DELETE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return an error state that file not exists", (done) => {
            chai.request(server)
                .get("/api/did")
                .set("companyName", TEST_DATA.companyName)
                .set("publicKey", TEST_DATA.publicKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });
    });
});