import express from "express";
import multer from "multer";
import keccak256 from "keccak256";

import GithubDB from "../github_db/index.js";
import { ERROR_CODES } from "../constants/index.js";
import { mockCall } from "../helpers/index.js";

const router = express.Router();

const upload = {
    single: (fileName) =>
        multer({
            storage: multer.memoryStorage(),
        }).single(fileName),
};

/**
 * @swagger
 * /api/old-doc:
 *   post:
 *     summary: Old way to create a new document for a company.
 *     tags: ["Document controller"]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 required: true
 *               companyName:
 *                 type: string
 *                 description: Name of the company (user).
 *                 example: Kukulu
 *                 required: true
 *     responses:
 *       201:
 *         description: Return a success message if document is successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                      type: String
 *                      description: Confirm message.
 *                      example: Create document success
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     errorCode:
 *                      type: int
 *                      description: Error code.
 *                      example: Missing parameters
 */
router
    .route("/api/old-doc")
    .post(upload.single("document"), async (req, res) => {
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

            res.status(200).json({
                data: { message: "Create document success" },
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json(err);
        }
    });

/**
 * @swagger
 * /api/doc-exists:
 *   post:
 *     summary: Check if document with the given name already exists within the same company.
 *     tags: ["Document controller"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Name of the company (user).
 *                 example: Kukulu
 *               fileName:
 *                 type: string
 *                 description: Name of the document.
 *                 example: random_string
 *     responses:
 *       200:
 *         description: Return true/false on whether a file is existed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     isExisted:
 *                       type: Boolean
 *                       description: True if file is already existed, otherwise false.
 *                       example: false
 */
router.route("/api/doc-exists").post(async (req, res) => {
    const { fileName, companyName } = req.body;

    try {
        const branchName = `DOC_${companyName}`;
        const isExisted = await GithubDB.isExistedFile(fileName, branchName);

        res.status(200).json({
            data: { isExisted },
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/doc:
 *   post:
 *     summary: Create a new document for a company.
 *     tags: ["Document controller"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wrappedDocument:
 *                 type: object
 *                 description: Javascript object of a wrap document.
 *                 example: {
 *                            "version": "https://schema.openattestation.com/2.0/schema.json",
 *                            "data": {
 *                              "name": "UUIDV4:string:...",
 *                              "issuers": [
 *                              {
 *                                  "identityProof": {
 *                                  "type": "UUIDV4:string:DID",
 *                                  "location": "UUIDV4:string:fuixlabs.com"
 *                               },
 *                               "did": "UUIDV4:string:....",
 *                                "tokenRegistry": "UUIDV4:string:...",
 *                                          "address": "UUIDV4:string:..."
 *                                      }
 *                                  ]
 *                              },
 *                              "signature": {
 *                                   "type": "SHA3MerkleProof",
 *                                   "targetHash": "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
 *                                   "proof": [],
 *                                    "merkleRoot": "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987"
 *                               }
 *                           }
 *               companyName:
 *                 type: string
 *                 description: Company's name.
 *                 example: Kukulu
 *               fileName:
 *                 type: string
 *                 description: Name of the file (user's input).
 *                 example: random_name
 *     responses:
 *       201:
 *         description: Return a success message if document is successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                      type: String
 *                      description: Confirm message.
 *                      example: Create document success
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     errorCode:
 *                      type: int
 *                      description: Error code.
 *                      example: Missing parameters
 */
router.route("/api/doc").post(async (req, res) => {
    const { wrappedDocument, fileName, companyName } = req.body;

    try {
        const branchName = `DOC_${companyName}`;
        await GithubDB.createBranchIfNotExist(branchName);

        const ownerPublicKey = await mockCall();

        await GithubDB.createNewFile(
            `${fileName}.document`,
            wrappedDocument,
            branchName,
            `New Wrap Document from company ${companyName}`
        );

        await GithubDB.createNewFile(
            `${fileName}.did`,
            {
                controller: ownerPublicKey,
                did: `did:some_string:${companyName}:${ownerPublicKey}`,
            },
            branchName,
            `DID for new document '${fileName}' from company ${companyName}`
        );

        res.status(200).json({
            data: { message: "Create document success" },
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

export default router;
