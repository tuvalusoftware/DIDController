import multer from "multer";

const getRandomString = (strLen = 10) => {
    return Array(strLen + 1)
        .join((Math.random().toString(36) + "00000000000000000").slice(2, 18))
        .slice(0, strLen);
};

const mockCall = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(getRandomString(10)), 500);
    });
};

const upload = {
    single: (fileName) =>
        multer({
            storage: multer.memoryStorage(),
        }).single(fileName),
};

const file = async (req, res, next) => {
    console.log("RUn");
    const { companyName } = req.body;
    const document = req.file;
    if (!document || !companyName) {
        return res.status(400).json(ERROR_CODES.MISSING_PARAMETERS);
    }

    try {
        const { buffer, originalname: fileName } = document;
        const base64string = buffer.toString("base64");
        const hashValue = keccak256(base64string).toString("hex");

        const branchName = `DOC_${companyName}`;
        await GithubDB.createBranchIfNotExist(branchName);
        await GithubDB.createNewFile(
            fileName,
            base64string,
            branchName,
            `New Document from company ${companyName}`
        );

        const sampleData = {
            version: "https://schema.openattestation.com/2.0/schema.json",
            data: {
                name: "UUIDV4:string:...", // filename
                issuers: [
                    {
                        identityProof: {
                            type: "UUIDV4:string:DID",
                            location: "UUIDV4:string:fuixlabs.com",
                        },
                        did: "UUIDV4:string:....",
                        tokenRegistry: "UUIDV4:string:...", // token policy address
                        address: "UUIDV4:string:...",
                    },
                ],
            },
            signature: {
                type: "SHA3MerkleProof",
                targetHash:
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                proof: [],
                merkleRoot:
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
            },
        };

        const { signature } = sampleData;
        await GithubDB.createNewFile(
            `${signature.targetHash}.json`,
            sampleData,
            branchName,
            `New Wrap document from company ${companyName}`
        );

        res.status(201).json({
            data: { message: "Create document success" },
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
};

export { getRandomString, mockCall };
