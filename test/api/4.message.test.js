import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxyConfig from "../../db/github/index.js";
import server from "../../server.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.MESSAGE_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const RECEIVER_PK = "MOCHA_public_key_12345";
const BRANCH_NAME = `MSG_${RECEIVER_PK.substring(0, 5)}`;

const MESSAGE_CONTENT = {
    receiver: `did:string:companyA:${RECEIVER_PK}`,
    sender: "did:string:companyC:sender_public_key",
    content: "Try to test",
};

const MESSAGE_CONTENT2 = {
    receiver: `did:string:companyA:${RECEIVER_PK}`,
    sender: "did:string:companyC:sender_public_key",
    content: "Try to test 2nd",
};

let MESSAGES_IDs = [];

describe("MESSAGE", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(BRANCH_NAME);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(BRANCH_NAME);
    });

    describe("/POST create new message (notification)", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/message")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return an 'invalid Public Key' message", (done) => {
            chai.request(server)
                .post("/api/message")
                .send({
                    message: { ...MESSAGE_CONTENT, receiver: "in va lid pk" },
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MESSAGE_CONTENT_INVALID)
                    );

                    done();
                });
        });

        it("it should return a success message states that Message is saved successfully", (done) => {
            chai.request(server)
                .post("/api/message")
                .send({ message: MESSAGE_CONTENT })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return a success message states that Message is saved successfully - 2nd time", (done) => {
            chai.request(server)
                .post("/api/message")
                .send({ message: MESSAGE_CONTENT2 })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.SAVE_SUCCESS)
                    );

                    done();
                });
        });
    });

    describe("/GET get messages from a receiver", () => {
        it("it should create a new branch from the receiver public key", async () => {
            const branch = await GithubProxy.getBranchInfo(BRANCH_NAME);

            expect(branch.name).equal(BRANCH_NAME);
        });

        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/message/receiver")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'file not found' error as the provided public key is invalid", (done) => {
            chai.request(server)
                .get("/api/message/receiver")
                .set("publicKey", "in va lid public key")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MESSAGE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an array of 2 messages", (done) => {
            chai.request(server)
                .get("/api/message/receiver")
                .set("publicKey", RECEIVER_PK)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("array").length(2);

                    const data = res.body.map((msg) => {
                        MESSAGES_IDs.push(msg.id);
                        delete msg.id;
                        return msg;
                    });

                    expect(JSON.stringify(data)).equal(
                        JSON.stringify([MESSAGE_CONTENT, MESSAGE_CONTENT2])
                    );

                    done();
                });
        });
    });

    describe("/GET get messages by ID", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .get("/api/message")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MISSING_PARAMETERS)
                    );

                    done();
                });
        });

        it("it should return a 'file not found' error as the provided public key is invalid", (done) => {
            chai.request(server)
                .get("/api/message")
                .set("publicKey", "in va lid public key")
                .set("msgID", "in va lid message ID")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.MESSAGE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an message correspond with the provided msgID", (done) => {
            chai.request(server)
                .get("/api/message")
                .set("publicKey", RECEIVER_PK)
                .set("msgID", MESSAGES_IDs[0])
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    delete res.body.id;
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(MESSAGE_CONTENT)
                    );
                    done();
                });
        });

        it("it should return an message correspond with the provided msgID - 2nd time", (done) => {
            chai.request(server)
                .get("/api/message")
                .set("publicKey", RECEIVER_PK)
                .set("msgID", MESSAGES_IDs[1])
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.be.an("object");

                    delete res.body.id;
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(MESSAGE_CONTENT2)
                    );
                    done();
                });
        });
    });
});
