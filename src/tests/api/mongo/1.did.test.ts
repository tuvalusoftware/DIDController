import chai from "chai";
import chaiHttp from "chai-http";

import { OPERATION_CODES } from "../../../constants/common";
import { ERROR_CODES } from "../../../errors/errorCodes";
import server from "../../../server";
import { clearCollections } from "../../testHelpers";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_COMPANY = "MOCHA____TESTING";
const TEST_DATA = {
    companyName: TEST_COMPANY,
    publicKey: "public_key",
    content: {
        controller: "public_key",
        did: "did:some_string:company:public_key",
        data: {
            date: "10-10-2000",
        },
    },
};

const TEST_DATA2 = {
    companyName: TEST_COMPANY,
    publicKey: "public_key_2",
    content: {
        controller: "public_key_2",
        did: "did:some_string:company:public_key_2",
        data: {
            name: "Jane Doe",
            gender: "female",
            dayOfBirth: "12/05/1970",
            address: "27, Avenue X, Birmingham city",
            country: "UK",
            identityNumber: "87654567876",
            identityDocumentType: "123213456",
            phone: "097657890",
        },
    },
};

const INVALID_DATA = {
    companyName: TEST_COMPANY,
    publicKey: "public_key_invalid",
    content: {},
};

const UPDATED_DATA = {
    companyName: TEST_COMPANY,
    publicKey: "public_key_2",
    content: {
        controller: "public_key_2",
        did: "did:some_string:company:public_key_2",
        data: {
            name: "Mary Doe",
            gender: "female",
            dayOfBirth: "12/08/1970",
            address: "10, Avenue ZHY, Venice city",
            country: "Italy",
            identityNumber: "0987654",
            identityDocumentType: "123987634567",
            phone: "0912376544",
            updated: true,
        },
    },
};

describe("DID", function () {
    this.timeout(0);

    this.beforeAll(async () => {
        await clearCollections();
    });

    this.afterAll(async () => {
        await clearCollections();
    });

    describe("/POST create new DID", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/v2/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is saved successfully", (done) => {
            chai.request(server)
                .post("/api/v2/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body).deep.equal(OPERATION_CODES.SAVE_SUCCESS);

                    done();
                });
        });

        it("it should return an 'already exist' message", (done) => {
            chai.request(server)
                .post("/api/v2/did")
                .send(TEST_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.FILE_EXISTED.error_code
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is saved successfully", (done) => {
            chai.request(server)
                .post("/api/v2/did")
                .send(TEST_DATA2)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body).deep.equal(OPERATION_CODES.SAVE_SUCCESS);

                    done();
                });
        });

        it("it should return an 'invalid content' message as the provided content is invalid", (done) => {
            chai.request(server)
                .post("/api/v2/did")
                .send(INVALID_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });
    });

    describe("/GET get single did", () => {
        it("it should GET a DID", (done) => {
            chai.request(server)
                .get("/api/v2/did")
                .query({
                    publicKey: TEST_DATA.publicKey,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("content");

                    expect(res.body.content.controller).equals(
                        TEST_DATA.content.controller
                    );
                    expect(res.body.content.data?.date).equals(
                        TEST_DATA.content.data.date
                    );

                    done();
                });
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/v2/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });
    });

    describe("/GET get all dids of a company", () => {
        it("it should GET an array of DID from a company", (done) => {
            chai.request(server)
                .get("/api/v2/did/all")
                .query({
                    companyName: TEST_COMPANY,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(2);

                    const nameArr = [TEST_DATA, TEST_DATA2].map(
                        (data) => `${data.publicKey}`
                    );
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(nameArr)
                    );

                    done();
                });
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/v2/did/all")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' cannot be found", (done) => {
            chai.request(server)
                .get("/api/v2/did/all")
                .query({
                    companyName: "INVALID_COMPANY_NAME",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.COMPANY_NOT_FOUND.error_code
                    );

                    done();
                });
        });
    });

    describe("/PUT update data of a did", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .put("/api/v2/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a 'public key not found' error as the param 'publicKey' is invalid", (done) => {
            chai.request(server)
                .put("/api/v2/did")
                .send({ ...UPDATED_DATA, publicKey: "INVALID_PUBLIC_KEY" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.FILE_NOT_FOUND.error_code
                    );

                    done();
                });
        });

        it("it should return an 'invalid content' message as the provided content is invalid", (done) => {
            chai.request(server)
                .put("/api/v2/did")
                .send(INVALID_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is updated successfully", (done) => {
            chai.request(server)
                .put("/api/v2/did")
                .send(UPDATED_DATA)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(OPERATION_CODES.UPDATE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should GET the updated DID", (done) => {
            chai.request(server)
                .get("/api/v2/did")
                .query({
                    companyName: TEST_DATA2.companyName,
                    publicKey: TEST_DATA2.publicKey,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    res.body.should.have.property("content");

                    res.body.should.have
                        .property("name")
                        .eql(TEST_DATA2.publicKey);

                    expect(res.body.content.controller).equals(
                        UPDATED_DATA.content.controller
                    );
                    expect(res.body.content.data).deep.equals(
                        UPDATED_DATA.content.data
                    );

                    done();
                });
        });
    });

    describe("/DELETE delete a DID", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .delete("/api/v2/did")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a 'public key not found' error as the param 'publicKey' is invalid", (done) => {
            chai.request(server)
                .delete("/api/v2/did")
                .query({
                    publicKey: "INVALID_PUBLIC_KEY",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.FILE_NOT_FOUND.error_code
                    );

                    done();
                });
        });

        it("it should return a success message states that DID is deleted successfully", (done) => {
            chai.request(server)
                .delete("/api/v2/did")
                .query({
                    publicKey: TEST_DATA.publicKey,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(OPERATION_CODES.DELETE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return an error state that file not exists", (done) => {
            chai.request(server)
                .get("/api/v2/did")
                .query({
                    publicKey: TEST_DATA.publicKey,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.FILE_NOT_FOUND.error_code
                    );

                    done();
                });
        });
    });
});
