import chai from "chai";
import chaiHttp from "chai-http";

import { OPERATION_CODES } from "../../../constants/common";
import { ERROR_CODES } from "../../../errors/errorCodes";
import server from "../../../server";
import { clearCollections } from "../../testHelpers";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const W3C_VC_EXAMPLE_1 = {
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2",
    ],
    id: "http://university.example/credentials/58473",
    type: ["VerifiableCredential", "ExampleAlumniCredential"],
    issuer: "https://university.example/issuers/565049",
    validFrom: "2010-01-01T00:00:00Z",
    credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        alumniOf: {
            id: "did:example:c276e12ec21ebfeb1f712ebc6f1",
            name: "Example University",
        },
    },
    proof: {
        type: "Ed25519Signature2020",
        created: "2021-11-13T18:19:39Z",
        verificationMethod: "https://university.example/issuers/14#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwRdo",
    },
};

const W3C_VC_EXAMPLE_2 = {
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2",
    ],
    id: "http://university.example/credentials/456787",
    type: ["VerifiableCredential", "ExampleAlumniCredential"],
    issuer: "https://university.example/issuers/565049",
    validFrom: "2010-01-01T00:00:00Z",
    credentialSubject: [
        {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            alumniOf: {
                id: "did:example:c276e12ec21ebfeb1f712ebc6f1",
                name: "CTU University",
            },
        },
        {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec22",
            alumniOf: {
                id: "did:example:c276e12ec21ebfeb1f712ebc6f2",
                name: "FPT University",
            },
        },
    ],
    proof: {
        type: "Ed25519Signature2020",
        created: "2021-11-13T18:19:39Z",
        verificationMethod: "https://university.example/issuers/14#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwHji",
    },
};

const CML_VC_EXAMPLE_1 = {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: "did:fuixlabs:commonlands:12345",
    type: ["VerifiableCredential"],
    issuer: "https://dominium.com",
    validFrom: "2010-01-01T19:23:24Z",
    credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        claims: {
            id: "did:fuixlabs:commonlands:1234567890",
            plot: "65191bba01a8fd1c431262a1",
            user: "65191bba01a8fd1c431262a2",
            type: "owner",
            plotCertificate: "did:fuixlabs:commonlands:09876",
        },
    },
    proof: {
        type: "Ed25519Signature2020",
        created: "2021-11-13T18:19:39Z",
        verificationMethod: "https://dominium.com/issuers/14#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSweDf",
    },
};

const CML_VC_EXAMPLE_1_UPDATED_CREDENTIAL_SUBJECT = {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    claims: {
        id: "did:fuixlabs:commonlands:1234567890",
        plot: "65191bba01a8fd1c431262a1",
        user: "65191bba01a8fd1c431262a2",
        type: "renter",
        plotCertificate: "did:fuixlabs:commonlands:09876",
        status: "pending",
    },
};

const CML_VC_EXAMPLE_2 = {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: "did:fuixlabs:commonlands:56780",
    type: ["VerifiableCredential", "LandContractCredential"],
    issuer: "https://dominium.com",
    credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12gfg56",
        signBy: "did:example:ebfeb1f712ebc6f1c276e12gfg56",
        contractDid: "did:example:ebfeb1f712ebc6f1c276e12g000",
    },
    proof: {
        type: "Ed25519Signature2020",
        created: "2021-11-13T18:19:39Z",
        verificationMethod: "https://dominium.com/issuers/14#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSweDf",
    },
};

describe("Verifiable Credential", function () {
    this.timeout(0);

    this.beforeAll(async () => {
        await clearCollections();
    });

    this.afterAll(async () => {
        await clearCollections();
    });

    describe("/POST create new credential", () => {
        it("it should return a 'missing params' error as the 'id' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a 'invalid input' error as the 'id' is wrongly formatted", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ id: "12345" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("id")).to.be.true;
                    expect(res.body.error_detail.includes("Invalid DID format"))
                        .to.be.true;

                    done();
                });
        });

        it("it should return a 'missing params' error as the '@contexts' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ ...W3C_VC_EXAMPLE_1, "@context": undefined })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("context")).to.be
                        .true;
                    expect(res.body.error_detail.includes("Required")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a 'missing params' error as the 'type' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ ...W3C_VC_EXAMPLE_1, type: undefined })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("type")).to.be.true;
                    expect(res.body.error_detail.includes("Required")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a 'missing params' error as the 'issuer' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ ...W3C_VC_EXAMPLE_1, issuer: undefined })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("issuer")).to.be.true;
                    expect(res.body.error_detail.includes("Required")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a 'missing params' error as the 'proof' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ ...W3C_VC_EXAMPLE_1, proof: undefined })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("proof")).to.be.true;
                    expect(res.body.error_detail.includes("Required")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a 'missing params' error as the 'credentialSubject' is not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ ...W3C_VC_EXAMPLE_1, credentialSubject: undefined })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("credentialSubject"))
                        .to.be.true;
                    expect(res.body.error_detail.includes("Required")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully - 1", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send(W3C_VC_EXAMPLE_1)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.SAVE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return 'credential existed' error", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send(W3C_VC_EXAMPLE_1)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.CREDENTIAL_EXISTED.error_code
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully - 2", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send(W3C_VC_EXAMPLE_2)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.SAVE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully - 3", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send(CML_VC_EXAMPLE_1)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.SAVE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully - 4", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send(CML_VC_EXAMPLE_2)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.SAVE_SUCCESS.message
                    );

                    done();
                });
        });
    });

    describe("/GET get all credentials", () => {
        it("it should return all stored credentials", (done) => {
            chai.request(server)
                .get("/api/credential/all")
                .end((err, res) => {
                    res.should.have.status(200);

                    expect(res.body).to.be.an("array").lengthOf(4);

                    expect(
                        res.body.find(
                            (vc: any) => vc.id === W3C_VC_EXAMPLE_1.id
                        )
                    ).to.not.be.undefined;
                    expect(
                        res.body.find(
                            (vc: any) => vc.id === W3C_VC_EXAMPLE_2.id
                        )
                    ).to.not.be.undefined;
                    expect(
                        res.body.find(
                            (vc: any) => vc.id === CML_VC_EXAMPLE_1.id
                        )
                    ).to.not.be.undefined;
                    expect(
                        res.body.find(
                            (vc: any) => vc.id === CML_VC_EXAMPLE_2.id
                        )
                    ).to.not.be.undefined;

                    done();
                });
        });
    });

    describe("/GET get credential by its ID", () => {
        it("it should return a 'invalid input' error as the provided id is wrongly format", (done) => {
            chai.request(server)
                .get(`/api/credential/invalid-id`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );
                    expect(res.body.error_detail.includes("id")).to.be.true;
                    expect(res.body.error_detail.includes("Invalid DID format"))
                        .to.be.true;

                    done();
                });
        });

        it("it should return a 'credential not found' error as the provided id is invalid", (done) => {
            chai.request(server)
                .get(`/api/credential/did:company:invalid-id`)

                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.CREDENTIAL_NOT_FOUND.error_code
                    );

                    done();
                });
        });

        it("it should return an credential correspond with the provided id - 1", (done) => {
            chai.request(server)
                .get(`/api/credential/${CML_VC_EXAMPLE_1.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(res.body.id).equals(CML_VC_EXAMPLE_1.id);
                    expect(res.body.issuer).deep.equals(
                        CML_VC_EXAMPLE_1.issuer
                    );
                    expect(res.body.credentialSubject).deep.equals(
                        CML_VC_EXAMPLE_1.credentialSubject
                    );
                    expect(res.body.proof).deep.equals(CML_VC_EXAMPLE_1.proof);

                    done();
                });
        });

        it("it should return an credential correspond with the provided id - 2", (done) => {
            chai.request(server)
                .get(`/api/credential/${CML_VC_EXAMPLE_2.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(res.body.id).equals(CML_VC_EXAMPLE_2.id);
                    expect(res.body.issuer).deep.equals(
                        CML_VC_EXAMPLE_2.issuer
                    );
                    expect(res.body.credentialSubject).deep.equals(
                        CML_VC_EXAMPLE_2.credentialSubject
                    );
                    expect(res.body.proof).deep.equals(CML_VC_EXAMPLE_2.proof);

                    done();
                });
        });
    });

    describe("/PUT update credential", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .put("/api/credential")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.INVALID_INPUT.error_code
                    );

                    done();
                });
        });

        it("it should return a 'credential not found' error as the provided hash is invalid", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({ ...CML_VC_EXAMPLE_1, id: "did:example:not-found" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.error_code).equal(
                        ERROR_CODES.CREDENTIAL_NOT_FOUND.error_code
                    );

                    done();
                });
        });

        it("it should return a success message after modify the content of credential subject", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({
                    ...CML_VC_EXAMPLE_1,
                    credentialSubject:
                        CML_VC_EXAMPLE_1_UPDATED_CREDENTIAL_SUBJECT,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.UPDATE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return an updated credential correspond with the provided id - 1", (done) => {
            chai.request(server)
                .get(`/api/credential/${CML_VC_EXAMPLE_1.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(res.body.id).equals(CML_VC_EXAMPLE_1.id);
                    expect(res.body.issuer).deep.equals(
                        CML_VC_EXAMPLE_1.issuer
                    );
                    expect(res.body.credentialSubject).deep.equals(
                        CML_VC_EXAMPLE_1_UPDATED_CREDENTIAL_SUBJECT
                    );
                    expect(res.body.proof).deep.equals(CML_VC_EXAMPLE_1.proof);

                    done();
                });
        });

        it("it should return a success message after add 'validFrom', 'validUntil' fields into the credential", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({
                    ...CML_VC_EXAMPLE_2,
                    validFrom: "2022-09-13T12:00:00Z",
                    validUntil: "2023-09-13T12:00:00Z",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.UPDATE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return an updated credential correspond with the provided id - 2", (done) => {
            chai.request(server)
                .get(`/api/credential/${CML_VC_EXAMPLE_2.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(res.body.id).equals(CML_VC_EXAMPLE_2.id);
                    expect(res.body.issuer).deep.equals(
                        CML_VC_EXAMPLE_2.issuer
                    );
                    expect(res.body.credentialSubject).deep.equals(
                        CML_VC_EXAMPLE_2.credentialSubject
                    );
                    expect(res.body.proof).deep.equals(CML_VC_EXAMPLE_2.proof);
                    expect(res.body.validFrom.includes("2022-09-13")).to.be
                        .true;
                    expect(res.body.validUntil.includes("2023-09-13")).to.be
                        .true;

                    done();
                });
        });

        it("it should return a success message after remove 'validUntil' field of the credential", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({
                    ...CML_VC_EXAMPLE_2,
                    validFrom: "2022-09-13T12:00:00Z",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(res.body.message).equal(
                        OPERATION_CODES.UPDATE_SUCCESS.message
                    );

                    done();
                });
        });

        it("it should return an updated credential correspond with the provided id - 3", (done) => {
            chai.request(server)
                .get(`/api/credential/${CML_VC_EXAMPLE_2.id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(res.body.id).equals(CML_VC_EXAMPLE_2.id);
                    expect(res.body.issuer).deep.equals(
                        CML_VC_EXAMPLE_2.issuer
                    );
                    expect(res.body.credentialSubject).deep.equals(
                        CML_VC_EXAMPLE_2.credentialSubject
                    );
                    expect(res.body.proof).deep.equals(CML_VC_EXAMPLE_2.proof);
                    expect(res.body.validFrom.includes("2022-09-13")).to.be
                        .true;
                    expect(res.body.validUntil).to.be.undefined;

                    done();
                });
        });
    });
});
