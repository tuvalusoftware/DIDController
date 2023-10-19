import chai from "chai";
import chaiHttp from "chai-http";

import { OPERATION_CODES } from "../../../constants/common";
import { ERROR_CODES } from "../../../errors/errorCodes";
import server from "../../../server";
import { clearCollections } from "../../testHelpers";

let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const TEST_DATA = {
  wrappedDocument: {
    data: {
      name: "a1567bdd-4a3a-4deb-b1ef-885433491774:string:Bill of Lading",
      title: "9f892b00-3d03-47b1-b33b-2d4ad97abce6:string:Test Title By Caps",
      remarks:
        "56f69a42-889a-4d73-9dcc-6442958b3b95:string:Test Remarks By Caps",
      fileName: "620a0bb2-1598-4114-a97b-37b56fbbf83a:string:test_file_name_10",
      companyName: "1ab0be15-728c-4ae8-8521-ad1fddc03a0f:string:Fuixlabs",
      did: "8c3dcdb1-f16a-497c-92ad-26b934aaf0b0:string:did:fuixlabs:HAOCUTECOMPANY:test_file_name_10",
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
  companyName: "Fuixlabs",
  fileName: "test_file_name_10",
};

let ORIGINAL_DID_DOC = null;

const NOT_EXIST_FILE = "FILE__NOT__EXIST";
const INVALID_COMPANY_NAME = "INVALID__COMPANY__NAME";
const INVALID_FILE_NAME = "INVALID_FILE_NAME";
const TEST_PUBLIC_KEY = "abcdxyz12345";

const TEST_WRAPPED_DOCS = [
  {
    fileName: "wrapped_doc_test",
    wrappedDocument: {
      data: {
        issuers: [{ address: TEST_PUBLIC_KEY }],
        content: "This is a sample wrapped doc 1",
      },
      signature: {
        targetHash: "1234567rtyuio",
      },
    },
    companyName: "TEST_BRANCH",
  },
  {
    fileName: "wrapped_doc_test2",
    wrappedDocument: {
      data: {
        issuers: [{ address: TEST_PUBLIC_KEY }],
        content: "This is a sample wrapped doc 2",
      },
      signature: {
        targetHash: "cvbnmnbvcxfghjnbvfr67ui",
      },
    },
    companyName: "TEST_BRANCH",
  },
  {
    fileName: "wrapped_doc_test3",
    wrappedDocument: {
      data: {
        issuers: [{ address: TEST_PUBLIC_KEY }],
        content: "This is a sample wrapped doc 3",
      },
      signature: {
        targetHash: "2345678sdfghjk4567fghj4567gh",
      },
    },
    companyName: "TEST_BRANCH",
  },
];

describe("DID", function () {
  this.timeout(0);

  this.beforeAll(async () => {
    await clearCollections();
  });

  this.afterAll(async () => {
    await clearCollections();
  });

  describe("/POST create new document", () => {
    it("it should return a 'missing params' error as the required params are not provided", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");

          expect(res.body.error_code).equal(
            ERROR_CODES.INVALID_INPUT.error_code
          );

          done();
        });
    });

    it("it should return a success message states that the wrapped document is saved successfully", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
        .send(TEST_DATA)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");

          expect(res.body).deep.equal(OPERATION_CODES.SAVE_SUCCESS);

          done();
        });
    });

    it("it should return a 'file already existed' error", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
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
  });

  describe("/GET check if document exists", () => {
    it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/exists")
        .query({})
        .end((err, res) => {
          expect(res.body.error_code).equal(
            ERROR_CODES.INVALID_INPUT.error_code
          );
          done();
        });
    });

    it("it should return 'false' as file does not exist", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/exists")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: NOT_EXIST_FILE,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("isExisted").eql(false);
          done();
        });
    });

    it("it should return 'true' as the file does exist", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/exists")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("isExisted").equal(true);
          done();
        });
    });
  });

  describe("/GET fetch document", () => {
    it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/")
        .end((err, res) => {
          res.body.should.be.a("object");
          expect(res.body.error_code).equal(
            ERROR_CODES.INVALID_INPUT.error_code
          );
          done();
        });
    });

    it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc")
        .query({
          companyName: "invalidCompanyName",
          fileName: TEST_DATA.fileName,
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

    it("it should return an 'file not found' error as the provided file name cannot be found", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: "INVALID_FILE_NAME",
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          expect(res.body.error_code).equal(
            ERROR_CODES.DID_DOC_NOT_FOUND.error_code
          );
          done();
        });
    });

    it("it should return 'true' because file had been created", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/exists")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("isExisted").eql(true);
          done();
        });
    });

    it("it should GET both the wrapped document and the did doc of the document", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
        })
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
            .eql(`${TEST_DATA.fileName}`);

          done();
        });
    });

    it("it should GET only the wrapped document as the flag indicates to exclude the did doc", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
          only: "doc",
        })
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
      chai
        .request(server)
        .get("/api/v2/doc")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
          only: "did",
        })
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
            .eql(`${TEST_DATA.fileName}`);

          ORIGINAL_DID_DOC = res.body.didDoc;
          done();
        });
    });
  });

  describe("/DELETE delete document from a branch", () => {
    it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
      chai
        .request(server)
        .delete("/api/v2/doc/")
        .end((err, res) => {
          res.body.should.be.a("object");
          expect(res.body.error_code).equal(
            ERROR_CODES.INVALID_INPUT.error_code
          );
          done();
        });
    });

    it("it should return an 'file name not found' error as the provided file name cannot be found", (done) => {
      chai
        .request(server)
        .delete("/api/v2/doc/")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: INVALID_FILE_NAME,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          expect(res.body.error_code).equal(
            ERROR_CODES.DID_DOC_NOT_FOUND.error_code
          );

          done();
        });
    });

    it("it should return a success message states that the wrapped document is deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/v2/doc")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
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

    it("it should return 'false' because file has been deleted", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/exists")
        .query({
          companyName: TEST_DATA.companyName,
          fileName: TEST_DATA.fileName,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("isExisted").eql(false);

          done();
        });
    });
  });

  describe("/GET fetch list of documents which user is their owner/holder", () => {
    it("it should return an 'missing params' error as the nessesary params are not provided", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/user")
        .end((err, res) => {
          res.body.should.be.a("object");
          expect(res.body.error_code).equal(
            ERROR_CODES.INVALID_INPUT.error_code
          );
          done();
        });
    });

    it("it should return a 'company not found' error as the param 'companyName' is invalid", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/user")
        .query({
          companyName: INVALID_COMPANY_NAME,
          publicKey: TEST_PUBLIC_KEY,
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

    it("it should return a success message - Save 1st wrapped", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
        .send(TEST_WRAPPED_DOCS[0])
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should return a success message - Save 2nd wrapped", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
        .send(TEST_WRAPPED_DOCS[1])
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should return a success message - Save 3rd wrapped", (done) => {
      chai
        .request(server)
        .post("/api/v2/doc")
        .send(TEST_WRAPPED_DOCS[2])
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should return the list of wrapped documents in which the user is the owner or holder", (done) => {
      chai
        .request(server)
        .get("/api/v2/doc/user")
        .query({
          companyName: "TEST_BRANCH",
          publicKey: TEST_PUBLIC_KEY,
        })
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
});
