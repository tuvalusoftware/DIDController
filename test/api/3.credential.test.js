import chai from "chai";
import chaiHttp from "chai-http";

import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import GithubProxyConfig from "../../db/github/index.js";
import server from "../../server.js";
import { containAllElement } from "../../utils/index.js";

const REPOSITORY = process.env.CREDENTIAL_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const HASH1 = "MOCHA_public_key_12345";
const HASH2 = "MOCHA_public_key_54321";
const BRANCH_NAME = `CRE_${HASH1.substring(0, 1)}`;

const CREDENTIAL_CONTENT1 = {
    issuer: "did:fuixlabs:TEST_CREDENTIAL_COMP:publicKey",
    credentialSubject: {
        newOwner: "did:fuixlabs:TEST_CREDENTIAL_COMP:pk2",
        object: "did:fuixlabs:TEST_CREDENTIAL_COMP:cover-letter",
        action: {
            code: 10,
            value: "endorseChangeOwnership",
            label: "Transfer of Owner",
            subTitle: "Owner can transfer the OwnerShip.",
            formLabel: "New Owner Address",
            buttonLabel: "Transfer",
            fields: [{ name: "newOwner", require: true, value: "ownerKey" }],
            updatedFields: [{ name: "ownerKey" }],
            surrender: false,
        },
    },
    signature: {
        signature: "public_key_signature",
        key: "key",
    },
    metadata: {},
    timestamp: 1658810415620,
    mintingNFTConfig: {
        type: "credential",
        policy: {
            type: "Native",
            id: "6549ecf62f67c8ee6b4f7a6708e53c6c5ac4e4267740acf70c079834",
            script: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfcf68eb",
            ttl: 3218041067,
            reuse: true,
        },
        asset: "asset_id",
    },
};

const CREDENTIAL_CONTENT2 = {
    issuer: "did:fuixlabs:TEST_CREDENTIAL_COMP:public_key3",
    credentialSubject: {
        newHolder: "did:fuixlabs:TEST_CREDENTIAL_COMP:public_key3",
        object: "did:fuixlabs:TEST_CREDENTIAL_COMP:cover-letter Hao2",
        action: {
            code: 2,
            value: "changeHolder",
            label: "Transfer of Holder",
            subTitle: "Owner can transfer the Holdership another Holder.",
            formLabel: "New Holder Address",
            buttonLabel: "Transfer",
            fields: [{ name: "newHolder", value: "holderKey", require: true }],
            updatedFieds: [{ name: "holderKey" }],
            surrender: false,
        },
    },
    signature: {
        signature: "public_key3_signature",
        key: "a401010327200621582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf",
    },
    metadata: {
        currentOwner: "public_key3",
    },
    timestamp: 1658817216717,
    mintingNFTConfig: {
        type: "credential",
        policy: {
            type: "Native",
            id: "d1192019e573464b9937c76d6b42d5f26a98c9581fe75eb7d3cdb3be",
            script: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfcf7757",
            ttl: 3218044759,
            reuse: true,
        },
        asset: "d1192019e573464b9937c76d6b42d5f26a98c9581fe75eb7d3cdb3beeabcc611260509a8da40c46ea5965121cbb90d5245e59a7f0be8821b0fba4804",
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
