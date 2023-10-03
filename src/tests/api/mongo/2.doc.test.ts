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
    companyName: "Fuixlabs",
    fileName: "test_file_name_10",
};

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
            chai.request(server)
                .post("/api/doc")
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

        it("it should return a 'company name invalid' error as the param 'companyName' is invalid", (done) => {
            chai.request(server)
                .post("/api/doc")
                .send({ ...TEST_DATA, companyName: "INVALID_COMPANY_NAME" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");

                    console.log(res.body);

                    expect(res.body.error_code).equal(
                        ERROR_CODES.COMPANY_NAME_INVALID.error_code
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

                    expect(res.body).deep.equal(OPERATION_CODES.SAVE_SUCCESS);

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

                    expect(res.body.error_code).equal(
                        ERROR_CODES.FILE_EXISTED.error_code
                    );

                    done();
                });
        });
    });
});
