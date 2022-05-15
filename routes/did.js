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
 *   post:
 *     summary: Retrieve all the DID of a company.
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
router.route("/api/get-all-did").post(async (req, res) => {
    const { companyName } = req.body;

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
            content: JSON.parse(did.object.text),
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
 *   post:
 *     summary: Retrieve one single DID.
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
router.route("/api/get-did").post(async (req, res) => {
    const { companyName, fileName } = req.body;

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
 *   post:
 *     summary: Delete one single DID.
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
router.route("/api/delete-did").post(async (req, res) => {
    const { companyName, fileName } = req.body;

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
 *     summary: Create a new single DID for a company.
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
    const { companyName, fileName, content } = req.body;

    try {
        const newBranch = `DID_${companyName}`;
        await GithubDB.createIfNotExist(newBranch);

        await GithubDB.createNewFile(
            fileName,
            content,
            newBranch,
            `New company ${companyName}`
        );

        return res.status(201).json({ message: "Success" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

/**
 * @swagger
 * /api/update-did:
 *   post:
 *     summary: Update existed DID of a company.
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
router.route("/api/update-did").post(async (req, res) => {
    const { companyName, fileName, content } = req.body;

    try {
        const newBranch = `DID_${companyName}`;
        await GithubDB.createIfNotExist(newBranch);

        await GithubDB.updateFile(
            fileName,
            content,
            newBranch,
            `Update DID ${fileName} of company ${companyName}`
        );

        return res.status(200).json({ message: "Update success" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

export default router;
