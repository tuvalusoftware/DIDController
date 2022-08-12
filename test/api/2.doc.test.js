import chai from "chai";
import chaiHttp from "chai-http";

import GithubProxyConfig from "../../db/github/index.js";
import server from "../../server.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const REPOSITORY = process.env.DOCUMENT_REPO;
const GithubProxy = GithubProxyConfig(REPOSITORY);

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_BRANCH = "MOCHA___TESTING";

const NOT_EXIST_BRANCH = "BRANCH___INVALID";
const NOT_EXIST_FILE = "FILE__NOT__EXIST";

const TEST_DATA = {
    wrappedDocument: {
        data: {
            name: "a1567bdd-4a3a-4deb-b1ef-885433491774:string:Bill of Lading",
            title: "9f892b00-3d03-47b1-b33b-2d4ad97abce6:string:Test Title By Caps",
            remarks:
                "56f69a42-889a-4d73-9dcc-6442958b3b95:string:Test Remarks By Caps",
            fileName:
                "620a0bb2-1598-4114-a97b-37b56fbbf83a:string:cover-letter Hao6",
            companyName:
                "1ab0be15-728c-4ae8-8521-ad1fddc03a0f:string:HAOCUTECOMPANY",
            did: "8c3dcdb1-f16a-497c-92ad-26b934aaf0b0:string:did:fuixlabs:HAOCUTECOMPANY:cover-letter Hao6",
            issuers: [
                {
                    identityProofType: {
                        type: "3685eeda-9b3a-456d-992f-48aaff2cec22:string:DID",
                        did: "a99c2d4b-7e7b-4281-b4fb-7016c90f5add:string:xxxx",
                    },
                    tokenRegistry:
                        "d2b9d8b7-b268-4b9e-a6a5-b6156552ac6a:string:dasdasdsaeiu201u32901djsakjdsalkdsa",
                    address:
                        "32529a91-b5f6-44cb-a964-1730cc62fb28:string:0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3",
                },
            ],
        },
        signature: {
            type: "SHA3MerkleProof",
            targetHash:
                "bb74ee3c478d90ab97d06014840dc472c315cc41e8517c56c5efee39bf8c108c",
            proof: [
                {
                    signature:
                        "845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2262623734656533633437386439306162393764303630313438343064633437326333313563633431653835313763353663356566656533396266386331303863227d58406db0206ed95090a5031b5bbbcfe77eaed85f7e4acb9bbdf8b995d14f4eee12a0a35623f349980a327fb7fc40f47b9b5d61158925edd8fea5242f67fb41bf6400",
                },
            ],
            merkleRoot:
                "bb74ee3c478d90ab97d06014840dc472c315cc41e8517c56c5efee39bf8c108c",
        },
        policyId: "d1082d0b547424c25487edc8f45d19041d1f64cba052b4f61ac6487c",
        assetId:
            "d1082d0b547424c25487edc8f45d19041d1f64cba052b4f61ac6487c3964316238393761323763636139653733613333386630626135383231333139",
    },
    companyName: TEST_BRANCH,
    fileName: "test_file_name_10",
};

const INVALID_FILE_NAME = "this is an ivalid file name";
const INVALID_PUBLIC_KEY = "this is an ivalid public key";
const INVALID_COMPANY_NAME = "this is an ivalid company name";
const TEST_PUBLIC_KEY = "abcdxyz12345";
const TEST_WRAPPED_DOCS = [
    {
        fileName: "wrapped_doc_test",
        wrappedDocument: {
            data: {
                content: "This is a sample wrapped doc 1",
                issuers: [{ address: TEST_PUBLIC_KEY }],
            },
            signature: {
                targetHash: "1234567rtyuio",
            },
        },
        companyName: TEST_BRANCH,
    },
    {
        fileName: "wrapped_doc_test2",
        wrappedDocument: {
            data: {
                content: "This is a sample wrapped doc 2",
                issuers: [{ address: TEST_PUBLIC_KEY }],
            },
            signature: {
                targetHash: "cvbnmnbvcxfghjnbvfr67ui",
            },
        },
        companyName: TEST_BRANCH,
    },
    {
        fileName: "wrapped_doc_test3",
        wrappedDocument: {
            data: {
                content: "This is a sample wrapped doc 3",
                issuers: [{ address: TEST_PUBLIC_KEY }],
            },
            signature: {
                targetHash: "2345678sdfghjk4567fghj4567gh",
            },
        },
        companyName: TEST_BRANCH,
    },
];

let ORIGINAL_DID_DOC = null;

const UPDATED_DID_DOC = {
    didDoc: {
        controller: ["owner_public_key", "holder_public_key"],
        did: "did:company_name:owner_pk:holder_pk",
        owner: "owner_public_key",
        holder: "holder_public_key",
        url: "test_file_name_10.document",
        meta_data: {
            timestamp: Date.now(),
        },
    },
    companyName: TEST_BRANCH,
    fileName: "test_file_name_10",
};

const INVALID_DID_DOC = {
    didDoc: {
        controller: ["owner_public_key", "holder_public_key"],
        did: "did:company_name:owner_pk:holder_pk",
        owner: "owner_public_key",
    },
    companyName: TEST_BRANCH,
    fileName: "test_file_name",
};

const EMPTY_DATA = {};

describe("DOC", function () {
    this.timeout(0);

    before(async () => {
        await GithubProxy.deleteBranchIfExist(`DOC_${TEST_BRANCH}`);
    });

    after(async () => {
        await GithubProxy.deleteBranchIfExist(`DOC_${TEST_BRANCH}`);
    });

    describe("/POST create new document", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
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

        it("it should return a 'company name invalid' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send({ ...TEST_DATA, companyName: INVALID_COMPANY_NAME })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NAME_INVALID)
                    );

                    done();
                });
        });

        it("it should return a success message states that the wrapped document is saved successfully", (done) => {
            chai.request(server)
                .post("/api/doc")
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

        it("it should return a 'file already existed' error", (done) => {
            chai.request(server)
                .post("/api/doc")
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
    });

    describe("/GET check if document exists", () => {
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'not found' error as the company name is invalid", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .set("companyName", NOT_EXIST_BRANCH)
                .set("fileName", NOT_EXIST_FILE)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return 'false' as file does not exist", (done) => {
            chai.request(server)
                .get("/api/doc/exists")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", NOT_EXIST_FILE)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("isExisted").eql(false);
                    done();
                });
        });

        it("it should return 'true' as the file does exist", (done) => {
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
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .get("/api/doc/")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .get("/api/doc")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an 'file not found' error as the provided file name cannot be found", (done) => {
            chai.request(server)
                .get("/api/doc")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", INVALID_FILE_NAME)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

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
                    res.body.didDoc.should.have.property("owner");
                    res.body.didDoc.should.have.property("holder");
                    res.body.didDoc.should.have.property("did");
                    res.body.didDoc.should.have
                        .property("url")
                        .eql(`${TEST_DATA.fileName}.document`);

                    done();
                });
        });

        it("it should GET only the wrapped document as the flag indicates to exclude the did doc", (done) => {
            chai.request(server)
                .get("/api/doc?only=doc")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(Object.keys(res.body).length).equal(1);

                    res.body.should.have
                        .property("wrappedDoc")
                        .eql(TEST_DATA.wrappedDocument);

                    done();
                });
        });

        it("it should GET only the did document of the wrapped document as the flag indicates to exclude the wrapped document", (done) => {
            chai.request(server)
                .get("/api/doc?only=did")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(Object.keys(res.body).length).equal(1);

                    res.body.should.have.property("didDoc");
                    res.body.didDoc.should.have.property("controller");
                    res.body.didDoc.should.have.property("owner");
                    res.body.didDoc.should.have.property("holder");
                    res.body.didDoc.should.have.property("did");
                    res.body.didDoc.should.have
                        .property("url")
                        .eql(`${TEST_DATA.fileName}.document`);

                    ORIGINAL_DID_DOC = res.body.didDoc;

                    done();
                });
        });
    });

    describe("/POST clone a document", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .post("/api/doc/clone")
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

        it("it should return a 'company name invalid' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .post("/api/doc/clone")
                .send({ ...TEST_DATA, companyName: INVALID_COMPANY_NAME })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NAME_INVALID)
                    );

                    done();
                });
        });

        it("it should return a success message states that the wrapped document is saved successfully", (done) => {
            chai.request(server)
                .post("/api/doc/clone")
                .send({ ...TEST_DATA, fileName: "clone_document" })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.CLONE_SUCCESS)
                    );

                    done();
                });
        });
    });

    describe("/GET fetch list of documents which user is their owner/holder", () => {
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .get("/api/doc/user")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .get("/api/doc/user")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("publicKey", TEST_PUBLIC_KEY)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an empty list as the provided public key is invalid or unknown", (done) => {
            chai.request(server)
                .get("/api/doc/user")
                .set("companyName", TEST_BRANCH)
                .set("publicKey", INVALID_PUBLIC_KEY)
                .end((err, res) => {
                    res.body.should.be.an("array");
                    res.body.length.should.equal(0);
                    done();
                });
        });

        it("it should return a success message - Save 1st wrapped", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send(TEST_WRAPPED_DOCS[0])
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    done();
                });
        });

        it("it should return a success message - Save 2nd wrapped", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send(TEST_WRAPPED_DOCS[1])
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    done();
                });
        });

        it("it should return a success message - Save 3rd wrapped", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send(TEST_WRAPPED_DOCS[2])
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    done();
                });
        });

        it("it should return the list of wrapped documents own by the user", (done) => {
            chai.request(server)
                .get("/api/doc/user")
                .set("companyName", TEST_BRANCH)
                .set("publicKey", TEST_PUBLIC_KEY)
                .end((err, res) => {
                    const wrappedDocContents = TEST_WRAPPED_DOCS.map(
                        (el) => el.wrappedDocument
                    );

                    res.body.should.be.an("array");
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(wrappedDocContents)
                    );
                    done();
                });
        });
    });

    describe("/GET search content", () => {
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .get("/api/doc/search-content")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .get(
                    `/api/doc/search-content?companyName=${encodeURIComponent(
                        INVALID_COMPANY_NAME
                    )}&searchString=${encodeURIComponent("Search String")}`
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should GET the wrapped document the contains the search string", (done) => {
            chai.request(server)
                .get(
                    `/api/doc/search-content?companyName=${TEST_BRANCH}&searchString=${encodeURIComponent(
                        "This is a sample wrapped doc 3"
                    )}`
                )

                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify([TEST_WRAPPED_DOCS[2].wrappedDocument])
                    );
                    done();
                });
        });
    });

    describe("/PUT update did doc of the wrapped document", () => {
        it("it should return a 'missing params' error as the required params are not provided", (done) => {
            chai.request(server)
                .put("/api/doc")
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

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .put("/api/doc")
                .send({ ...UPDATED_DID_DOC, companyName: INVALID_COMPANY_NAME })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an 'invalid content' error as the param 'fileName' is invalid", (done) => {
            chai.request(server)
                .put("/api/doc")
                .send({ ...UPDATED_DID_DOC, fileName: INVALID_PUBLIC_KEY })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.WRAP_DOC_DID_DOC_INVALID)
                    );

                    done();
                });
        });

        it("it should return an 'invalid content' message as the did doc content is invalid", (done) => {
            chai.request(server)
                .put("/api/doc")
                .send(INVALID_DID_DOC)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.WRAP_DOC_DID_DOC_INVALID)
                    );

                    done();
                });
        });

        it("it should return a success message states that did document is updated successfully", (done) => {
            chai.request(server)
                .put("/api/doc")
                .send(UPDATED_DID_DOC)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.UPDATE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should successfully GET the updated did document ", (done) => {
            chai.request(server)
                .get("/api/doc?only=did")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(Object.keys(res.body).length).equal(1);

                    res.body.should.have.property("didDoc");
                    expect(JSON.stringify(res.body.didDoc)).equal(
                        JSON.stringify(UPDATED_DID_DOC.didDoc)
                    );

                    done();
                });
        });
    });

    describe("/GET get history of did doc of wrapped document", () => {
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .get("/api/doc/did-doc-history")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .get("/api/doc/did-doc-history")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an 'file name not found' error as the provided file name cannot be found", (done) => {
            chai.request(server)
                .get("/api/doc/did-doc-history")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", INVALID_FILE_NAME)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should get all the previous history of the did doc", (done) => {
            chai.request(server)
                .get("/api/doc/did-doc-history")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    expect(res.body.length).equal(2);
                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify([
                            UPDATED_DID_DOC.didDoc,
                            ORIGINAL_DID_DOC,
                        ])
                    );
                    done();
                });
        });
    });

    describe("/DELETE delete document from a branch", () => {
        it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
            chai.request(server)
                .delete("/api/doc/")
                .end((err, res) => {
                    res.body.should.eql(ERROR_CODES.MISSING_PARAMETERS);
                    done();
                });
        });

        it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .delete("/api/doc/")
                .set("companyName", INVALID_COMPANY_NAME)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.COMPANY_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return an 'file name not found' error as the provided file name cannot be found", (done) => {
            chai.request(server)
                .delete("/api/doc/")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", INVALID_FILE_NAME)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(ERROR_CODES.FILE_NOT_FOUND)
                    );

                    done();
                });
        });

        it("it should return a success message states that the wrapped document is deleted successfully", (done) => {
            chai.request(server)
                .delete("/api/doc")
                .set("companyName", TEST_DATA.companyName)
                .set("fileName", TEST_DATA.fileName)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    expect(JSON.stringify(res.body)).equal(
                        JSON.stringify(SUCCESS_CODES.DELETE_SUCCESS)
                    );

                    done();
                });
        });

        it("it should return 'false' because file has been deleted", (done) => {
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
    });
});
