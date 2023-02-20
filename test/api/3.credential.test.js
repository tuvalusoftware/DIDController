import chai from "chai";
import chaiHttp from "chai-http";

import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import server from "../../server.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const HASH1 = "MOCHA_public_key_12345";
const HASH2 = "MOCHA_public_key_54321";
const BRANCH_NAME = `CRE_${HASH1.substring(0, 1)}`;

const CREDENTIAL_CONTENT1 = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
        "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: "urn:uuid:a63a60be-f4af-491c-87fc-2c8fd3007a58",
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    name: "JFF x vc-edu PlugFest 2 Interoperability",
    issuer: {
        type: ["Profile"],
        id: "did:key:z6Mkpb4tSWtxRsFgHNqNGUueiB17hPTdTVPqic8Nzvo95KRy",
        name: "Jobs for the Future (JFF)",
        image: {
            id: "https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png",
            type: "Image",
        },
    },
    issuanceDate: "2023-01-12T04:10:20.912Z",
    credentialSubject: {
        type: ["AchievementSubject"],
        id: "did:key:123",
        achievement: {
            id: "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
            type: ["Achievement"],
            name: "JFF x vc-edu PlugFest 2 Interoperability",
            description:
                "This credential solution supports the use of OBv3 and w3c Verifiable Credentials and is interoperable with at least two other solutions.  This was demonstrated successfully during JFF x vc-edu PlugFest 2.",
            criteria: {
                narrative:
                    "Solutions providers earned this badge by demonstrating interoperability between multiple providers based on the OBv3 candidate final standard, with some additional required fields. Credential issuers earning this badge successfully issued a credential into at least two wallets.  Wallet implementers earning this badge successfully displayed credentials issued by at least two different credential issuers.",
            },
            image: {
                id: "https://w3c-ccg.github.io/vc-ed/plugfest-2-2022/images/JFF-VC-EDU-PLUGFEST2-badge-image.png",
                type: "Image",
            },
        },
    },
    proof: {
        type: "Ed25519Signature2020",
        created: "2023-01-12T04:10:20Z",
        verificationMethod:
            "did:key:z6Mkpb4tSWtxRsFgHNqNGUueiB17hPTdTVPqic8Nzvo95KRy#z6Mkpb4tSWtxRsFgHNqNGUueiB17hPTdTVPqic8Nzvo95KRy",
        proofPurpose: "assertionMethod",
        proofValue:
            "z46xjxxfQvrsnePPyZwvoHLvtSiYDDnXafadeQanwnvnqnFQ6suErMRuamQrm5UvRHEfTZQAm6wqbZWWjJhLLJond",
    },
};

const CREDENTIAL_CONTENT2 = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/extensions.json",
    ],
    id: "urn:uuid:a63a60be-f4af-491c-87fc-2c8fd3007a58",
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    name: "JFF x vc-edu PlugFest 2 Interoperability",
    issuer: {
        type: ["Profile"],
        id: "did:key:z6MkhBYoPmPvTc8rGistr18Ddpc5JbLQRLqiWgkHPLLX1A7z",
        name: "Jobs for the Future (JFF)",
        image: {
            id: "https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png",
            type: "Image",
        },
    },
    issuanceDate: "2022-10-26T00:00:00Z",
    credentialSubject: {
        type: ["AchievementSubject"],
        id: "did:key:123",
        achievement: {
            id: "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
            type: ["Achievement"],
            name: "JFF x vc-edu PlugFest 2 Interoperability",
            description:
                "This credential solution supports the use of OBv3 and w3c Verifiable Credentials and is interoperable with at least two other solutions.  This was demonstrated successfully during JFF x vc-edu PlugFest 2.",
            criteria: {
                narrative:
                    "Solutions providers earned this badge by demonstrating interoperability between multiple providers based on the OBv3 candidate final standard, with some additional required fields. Credential issuers earning this badge successfully issued a credential into at least two wallets.  Wallet implementers earning this badge successfully displayed credentials issued by at least two different credential issuers.",
            },
            image: {
                id: "https://w3c-ccg.github.io/vc-ed/plugfest-2-2022/images/JFF-VC-EDU-PLUGFEST2-badge-image.png",
                type: "Image",
            },
        },
    },
    credentialSchema: [
        {
            id: "https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json",
            type: "1EdTechJsonSchemaValidator2019",
        },
    ],
    proof: {
        type: "Ed25519Signature2020",
        created: "2022-12-23T06:48:44.000Z",
        verificationMethod:
            "did:key:z6MkhBYoPmPvTc8rGistr18Ddpc5JbLQRLqiWgkHPLLX1A7z#z6MkhBYoPmPvTc8rGistr18Ddpc5JbLQRLqiWgkHPLLX1A7z",
        proofPurpose: "assertionMethod",
        proofValue:
            "z4vmEaB5SmAVkYdYpYbXCtaRY89F5yfwH8No1i2M5oTFzmYQ1FGMAK8qCGEgqXoHFQPnBWXKnYHKFFPFeFPjkK75A",
    },
};

describe("CREDENTIAL", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(BRANCH_NAME);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(BRANCH_NAME);
    });

    describe("/POST create new credential", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/credential")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ hash: HASH1, content: CREDENTIAL_CONTENT1 })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(OPERATION_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is saved successfully - 2nd time", (done) => {
            chai.request(server)
                .post("/api/credential")
                .send({ hash: HASH2, content: CREDENTIAL_CONTENT2 })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(OPERATION_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });
    });

    describe("/GET get credential by ID", () => {
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

        it("it should return a 'credential not found' error as the provided public key is invalid", (done) => {
            chai.request(server)
                .get("/api/credential")
                .query({ hash: "in va lid hash" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.CREDENTIAL_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an credential correspond with the provided hash", (done) => {
            chai.request(server)
                .get("/api/credential")
                .query({ hash: HASH1 })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(CREDENTIAL_CONTENT1)
                    );
                    done();
                });
        });

        it("it should return an credential correspond with the provided hash - 2nd time", (done) => {
            chai.request(server)
                .get("/api/credential")
                .query({ hash: HASH2 })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(CREDENTIAL_CONTENT2)
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
                    expect(res.body).to.be.an("array");

                    const allCredentialsToString = JSON.stringify(res.body);

                    expect(
                        allCredentialsToString.includes(
                            JSON.stringify(CREDENTIAL_CONTENT1)
                        )
                    ).equals(true);
                    expect(
                        allCredentialsToString.includes(
                            JSON.stringify(CREDENTIAL_CONTENT2)
                        )
                    ).equals(true);

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

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'credential not found' error as the provided hash is invalid", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({ hash: "in valid content", content: {} })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.CREDENTIAL_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a success message states that credential is updated successfully", (done) => {
            chai.request(server)
                .put("/api/credential")
                .send({
                    hash: HASH2,
                    content: { ...CREDENTIAL_CONTENT2, updated: true },
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(OPERATION_CODES.UPDATE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return an updated credential correspond with the provided hash", (done) => {
            chai.request(server)
                .get("/api/credential")
                .query({ hash: HASH2 })
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify({
                            ...CREDENTIAL_CONTENT2,
                            updated: true,
                        })
                    );
                    done();
                });
        });
    });
});
