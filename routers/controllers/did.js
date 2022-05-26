import GithubProxy from "../../db/github/index.js";

export default {
    getAllDIDs: async (req, res, next) => {
        const companyName = req.header("companyName");

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                branch
            );
            const DID_strings = await GithubProxy.getFilesOfTree(
                "",
                false,
                lastCommitOfBranch
            );

            const result = DID_strings.map((did) => ({
                name: did.name,
            }));

            return res.status(200).json(result);
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    getSingleDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        try {
            const branch = `DID_${companyName}`;
            const lastCommitOfBranch = await GithubProxy.getLastCommitSHA(
                branch
            );

            const fileData = await GithubProxy.getFile(
                `${fileName}.did`,
                lastCommitOfBranch
            );

            const data = { name: fileName, content: JSON.parse(fileData.text) };

            return res.status(200).json(data);
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    createNewDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        try {
            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            await GithubProxy.createNewFile(
                `${fileName}.did`,
                content,
                newBranch,
                `NEW: '${fileName}' DID Doc of company "${companyName}"`
            );

            return res
                .status(201)
                .json({ message: "New DID created successfully" });
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    updateDID: async (req, res, next) => {
        const { companyName, publicKey: fileName, content } = req.body;

        try {
            const newBranch = `DID_${companyName}`;
            await GithubProxy.createBranchIfNotExist(newBranch);

            await GithubProxy.updateFile(
                `${fileName}.did`,
                content,
                newBranch,
                `UPDATE: '${fileName}' DID of company ${companyName}`
            );

            return res.status(200).json({ message: "Update DID successfully" });
        } catch (err) {
            return res.status(200).json(err);
        }
    },
    deleteDID: async (req, res, next) => {
        const companyName = req.header("companyName");
        const fileName = req.header("publicKey");

        try {
            const branch = `DID_${companyName}`;
            await GithubProxy.deleteFile(
                `${fileName}.did`,
                branch,
                `DELETE: '${fileName}' DID of company ${companyName}`
            );

            return res.status(200).json({ message: "Delete success" });
        } catch (err) {
            return res.status(400).json(err);
        }
    },
};
