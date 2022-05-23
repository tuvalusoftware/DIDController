import express from "express";

import GithubDB from "../github_db/index.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     DID_Object:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: DID string.
 *           example: random_string
 *         content:
 *           type: object
 *           description: Content of the DID string in JSON format.
 *           example: { data: 'Value', dateCreated: '10-10-2000' }
 */

const router = express.Router();

/**
 * @swagger
 * /api/get-all-did:
 *   get:
 *     summary: Retrieve all the DID of a company.
 *     tags: ["DID controller"]
 *     parameters:
 *       - in: header
 *         name: companyName
 *         schema:
 *           type: string
 *           example: Kukulu
 *         required: true
 *     responses:
 *       200:
 *         description: Array of all DID object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DID_Object'
 *
 */
router.route("/api/get-all-did").get(async (req, res) => {
    const companyName = req.header("companyName");

    try {
        const branch = `DID_${companyName}`;
        const lastCommitOfBranch = await GithubDB.getLastCommitSHA(branch);
        const DID_strings = await GithubDB.getFilesOfTree(
            "",
            false,
            lastCommitOfBranch
        );

        const result = DID_strings.map((did) => ({
            name: did.name,
        }));

        return res.status(200).json({ data: result });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/get-did:
 *   get:
 *     summary: Retrieve one single DID.
 *     tags: ["DID controller"]
 *     parameters:
 *       - in: header
 *         name: companyName
 *         schema:
 *           type: string
 *           example: Kukulu
 *         required: true
 *       - in: header
 *         name: fileName
 *         schema:
 *           type: string
 *           example: random_did_string
 *         required: true
 *     responses:
 *       200:
 *         description: DID object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DID_Object'
 *
 */
router.route("/api/get-did").get(async (req, res) => {
    const companyName = req.header("companyName");
    const fileName = req.header("fileName");

    try {
        const branch = `DID_${companyName}`;
        const lastCommitOfBranch = await GithubDB.getLastCommitSHA(branch);

        const fileData = await GithubDB.getFile(fileName, lastCommitOfBranch);

        const data = { name: fileName, content: JSON.parse(fileData.text) };

        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/delete-did:
 *   delete:
 *     summary: Delete one single DID.
 *     tags: ["DID controller"]
 *     parameters:
 *       - in: header
 *         name: companyName
 *         schema:
 *           type: string
 *           example: Kukulu
 *         required: true
 *       - in: header
 *         name: fileName
 *         schema:
 *           type: string
 *           example: random_did_string
 *         required: true
 *     responses:
 *       200:
 *         description: DID object
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
 *                      example: Delete success
 *
 */
router.route("/api/delete-did").delete(async (req, res) => {
    const companyName = req.header("companyName");
    const fileName = req.header("fileName");

    try {
        const branch = `DID_${companyName}`;
        await GithubDB.deleteFile(
            fileName,
            branch,
            `Delete DID "${fileName}" of company ${companyName}`
        );

        return res.status(200).json({ message: "Delete success" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/new-did:
 *   post:
 *     summary: Create a new single DID doc for a company.
 *     tags: ["DID controller"]
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
 *               publicKey:
 *                 type: string
 *                 description: Public Key of the user's wallet.
 *                 example: random_string
 *               content:
 *                 type: object
 *                 description: Content (meta-data) of a DID string
 *                 example: { date: '10-10-2000' }
 *     responses:
 *       201:
 *         description: DID object
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
 *                      example: Create success
 *
 */
router.route("/api/new-did").post(async (req, res) => {
    const { companyName, publicKey, content } = req.body;

    try {
        const newBranch = `DID_${companyName}`;
        await GithubDB.createBranchIfNotExist(newBranch);

        await GithubDB.createNewFile(
            `${publicKey}.did`,
            content,
            newBranch,
            `New DID Doc of company "${companyName}"`
        );

        return res
            .status(201)
            .json({ message: "New DID created successfully" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/update-did:
 *   put:
 *     summary: Update existed DID of a company.
 *     tags: ["DID controller"]
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
 *                 description: DID string.
 *                 example: random_string
 *               content:
 *                 type: object
 *                 description: Content (meta-data) of a DID string
 *                 example: { date: '10-10-2000', info: 'Just updated' }
 *     responses:
 *       200:
 *         description: DID object
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
 *                      example: Update success
 *
 */
router.route("/api/update-did").put(async (req, res) => {
    const { companyName, fileName, content } = req.body;

    try {
        const newBranch = `DID_${companyName}`;
        await GithubDB.createBranchIfNotExist(newBranch);

        await GithubDB.updateFile(
            `${fileName}.did`,
            content,
            newBranch,
            `Update DID "${fileName}" of company ${companyName}`
        );

        return res.status(200).json({ message: "Update success" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

export default router;
