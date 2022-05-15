import axios from "axios";
import dotenv from "dotenv";

import { ERROR_CODES } from "../constants/index.js";

dotenv.config();

// Configurations
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const token = process.env.AUTH_TOKEN;

const gitDBUrl = `https://api.github.com/repos/${owner}/${repo}/`;
const gitGraphQLUrl = `https://api.github.com/graphql`;

const config = {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
    },
};

const GithubDB = {
    get(url) {
        return axios.get(gitDBUrl + url, config);
    },
    post(url, data) {
        return axios.post(gitDBUrl + url, data, config);
    },
    put(url, data) {
        return axios.put(gitDBUrl + url, data, config);
    },
    patch(url, data) {
        return axios.patch(gitDBUrl + url, data, config);
    },
    delete(url, data = {}) {
        return axios.delete(gitDBUrl + url, { data, ...config });
    },
};

/**
 * @description Make API call to the GraphQL Github API
 * @param {String} queryString A GraphQL query string
 * @returns {Promise} an Axios promise
 */
const GithubGraphQL = (queryString) =>
    axios.post(gitGraphQLUrl, JSON.stringify({ query: queryString }), config);

/**
 * @description Try to parse a string-typed data, if the string cannot be parsed, return itself
 * @param {String} dataString
 * @returns {String}
 */
const tryParse = (dataString) => {
    try {
        return JSON.parse(dataString);
    } catch (e) {
        return dataString;
    }
};

/**
 * @description Return the extension from a file path
 * @param {String} filePath Path to the file
 * @returns {String}
 */
const getFileExtension = (filePath) =>
    filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length) || null;

export default {
    /**
     *
     * @returns {Promise} All branches from a repo
     */
    getAllBranches: function () {
        return new Promise((resolve, reject) => {
            GithubDB.get(`branches`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    /**
     *
     * @param {String} branchName
     * @returns {Object} check if branch is exist and return the branch object
     */
    getBranchInfo: function (branchName = "main") {
        return new Promise((resolve, reject) => {
            this.getAllBranches().then((branches) => {
                const branch =
                    branches.find((br) => br.name === branchName) || null;

                return branch
                    ? resolve(branch)
                    : reject(ERROR_CODES.BRANCH_NOT_EXISTED);
            });
        });
    },
    /**
     * @description Return the last commit SHA (id) of a branch
     * @param {string} branch Name of the branch (default to main)
     * @returns {string}
     */
    getLastCommitSHA: function (branch = "main") {
        return new Promise((resolve, reject) => {
            GithubDB.get(`git/ref/heads/${branch}`)
                .then((response) => resolve(response.data.object.sha))
                .catch((err) => {
                    if (err.response.status === 404) {
                        return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                    }
                    return reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    /**
     *  Get a list of commits of a branch or a file, along with cursor info for pagination
     * @param {Number} deep How far back to get commits
     * @param {String} branchName Name of the branch
     * @param {String} filePath If file path is provided, return the commit's history of that file only
     * @param {String} cursor Point at the commit to retrieve the previous commit
     * @returns {Promise} An object contains list of branch, total of commits, the cursor to start (to start at which commit)
     */
    _getCommitHistory: function (
        deep = 5,
        branchName = "main",
        filePath = null,
        cursor = null
    ) {
        return new Promise((resolve, reject) => {
            const fileExpr = filePath ? `path: "${filePath}"` : "";
            const pagination = cursor ? `after: "${cursor}"` : "";

            const queryString = `
            {
                repository(owner: "${owner}", name: "${repo}") {
                    branch: ref(qualifiedName: "${branchName}") {
                        target {
                            ... on Commit {
                                history(first: ${deep}, ${fileExpr}, ${pagination}) {
                                    totalCount
                                    edges {
                                        node {
                                            ... on Commit {
                                                oid
                                                message
                                                committedDate 
                                            }
                                        }
                                    }
                                    pageInfo {
                                        endCursor
                                        hasNextPage
                                    }
                                }
                            }
                        }
                    }
                }
            }
            `;

            GithubGraphQL(queryString)
                .then((res) => {
                    if (res.data.errors) {
                        console.log(res.data.errors);
                        return reject(ERROR_CODES.GITHUB_API_ERROR);
                    }

                    if (!res.data.data.repository.branch) {
                        return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                    }

                    const { totalCount, pageInfo } =
                        res.data.data.repository.branch.target.history;

                    const branches =
                        res.data.data.repository.branch.target.history.edges.map(
                            (branch) => ({ ...branch.node })
                        );

                    resolve({ branches, totalCount, pageInfo });
                })
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    /**
     *  Get a list of commits of a branch or a file
     * @param {Number} deep How far back to get commits
     * @param {String} branchName Name of the branch
     * @param {String} filePath If file path is provided, return the commit's history of that file only
     * @returns {Promise} Array of commits of a branch
     */
    getCommitHistory: function (
        deep = 5,
        branchName = "main",
        filePath = null
    ) {
        return new Promise(async (resolve, reject) => {
            let numElements = deep;
            let results = [];
            let cursor = null;

            try {
                while (numElements > 0) {
                    const { branches, pageInfo } = await this._getCommitHistory(
                        numElements <= 100 ? numElements : 100,
                        branchName,
                        filePath,
                        cursor
                    );

                    results = [...results, ...branches];
                    if (!pageInfo.hasNextPage) break;

                    cursor = pageInfo.endCursor;
                    numElements -= 100;
                }

                resolve(results);
            } catch (err) {
                return reject(
                    err.response
                        ? ERROR_CODES.GITHUB_API_ERROR
                        : ERROR_CODES.UNKNOWN_ERROR
                );
            }
        });
    },
    /**
     * @description Return the content as a string (mostly base64 encoded) of file from repository
     * @param {String} fileSHA SHA (id) string of a file
     * @returns {String}
     */
    getBinaryContent: function (fileSHA) {
        return new Promise((resolve, reject) => {
            GithubDB.get(`git/blobs/${fileSHA}`)
                .then((response) => resolve(response.data.content))
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    /**
     * @description Return info of a file object
     * @param {String} filePath Path of the file
     * @param {String} commitSHA SHA of a commit, default to HEAD which is the last commit
     * @returns {Promise}
     */
    getFile: function (filePath, commitSHA = "HEAD") {
        const queryString = `
        query RepoFiles {
            repository(owner: "${owner}", name: "${repo}") {
                object(expression: "${commitSHA}:${filePath}") {
                    ... on Blob {
                        text
                        byteSize
                        oid
                        isBinary
                    }
                }
            }
        }
        `;

        return new Promise((resolve, reject) => {
            GithubGraphQL(queryString)
                .then(async (response) => {
                    if (response.status !== 200) {
                        return reject(ERROR_CODES.GITHUB_API_ERROR);
                    }

                    if (!response.data.data)
                        return reject(ERROR_CODES.GITHUB_API_ERROR);

                    // Check content in result
                    if (response.data.data?.repository.object) {
                        let data = response.data.data.repository.object;

                        // Check if file is binary type
                        if (
                            data.isBinary === null &&
                            getFileExtension(filePath) !== "json"
                        )
                            data.isBinary = true;

                        // Parse content to JS object if data is json
                        data.content = data.isBinary
                            ? await this.getBinaryContent(data.oid)
                            : tryParse(data.text);

                        resolve(data);
                    } else reject(ERROR_CODES.FILE_NOT_EXISTED);
                })
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    /**
     * @description Return all files from a folder of a repo
     * @param {String} treePath folder's path (default to an empty string - which mean the root folder of a repo)
     * @param {Boolean} allowFolder if true, the returns result will also include nested folder (default to true)
     * @param {String} commitSHA SHA of a commit, default to HEAD which is the last commit
     * @returns {Array} Array of files (or folders)' info in a tree path
     */
    getFilesOfTree: function (
        treePath = "",
        allowFolder = true,
        commitSHA = "HEAD"
    ) {
        const queryAllFiles = `
        query RepoFiles {
            repository(owner: "${owner}", name: "${repo}") {
                object(expression: "${commitSHA}:${treePath}") {
                    ... on Tree {
                        entries {
                            name
                            type
                            mode
                            
                            object {
                                ... on Blob {
                                    byteSize
                                    text
                                    isBinary
                                    oid
                                    }
                                }
                            }
                        }
                }
            }
        }  
        `;

        return new Promise((resolve, reject) => {
            GithubGraphQL(queryAllFiles)
                .then((response) => {
                    if (response.status !== 200) {
                        return reject(ERROR_CODES.GITHUB_API_ERROR);
                    }

                    const responseData = response.data.data.repository.object;
                    if (
                        (responseData &&
                            Object.keys(responseData).length === 0 &&
                            Object.getPrototypeOf(responseData) ===
                                Object.prototype) ||
                        !responseData
                    )
                        reject(ERROR_CODES.FOLDER_EXISTED);
                    else {
                        const results = allowFolder
                            ? responseData.entries
                            : responseData.entries.filter(
                                  (obj) => obj.type === "blob"
                              );

                        resolve(results);
                    }
                })
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    /**
     * @description Update or Create a new file to repository
     * @param {String} path Path of a file
     * @param {Object} content Content of a file
     * @param {String} branch Name of the branch to save the file (default to main)
     * @param {String} commitMessage The commit message (default to 'New commit')
     * @param {String} sha SHA string of a file that need to update
     * @returns {Promise}
     */
    _updateContent: async function (
        path,
        content,
        branch = "main",
        commitMessage = "New Commit",
        sha = null
    ) {
        const contentData =
            typeof content === "string"
                ? content
                : new Buffer.from(JSON.stringify(content)).toString("base64");

        let data = {
            path,
            content: contentData,
            branch,
            message: commitMessage,
        };

        data = sha ? { ...data, sha } : data;

        return GithubDB.put(`contents/${path}`, data);
    },
    /**
     * @description Create and save a new file to Repo
     * @param {String} path Path of a new file
     * @param {Object} content Content of a new file
     * @param {String} branch Name of the branch to save the file (default to main)
     * @param {String} commitMessage The commit message (default to 'New commit')
     * @returns {Promise}
     */
    createNewFile: function (
        path,
        content,
        branch = "main",
        commitMessage = "New Commit"
    ) {
        return new Promise((resolve, reject) => {
            this._updateContent(path, content, branch, commitMessage)
                .then((response) => {
                    const { path, sha, size } = response.data.content;
                    return resolve({ path, sha, size });
                })
                .catch((err) => {
                    if (err.response) {
                        // `\nStatus code: ${err.response.status}\nMessage: File ${path} is already exist\nAPI message: ${err.response.data.message}`
                        if (err.response.status === 422)
                            return reject(ERROR_CODES.FILE_EXISTED);
                    }

                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    /**
     * @description Update and save a file to Repo
     * @param {String} path Path of a file
     * @param {Object} content Content of a file
     * @param {String} branch Name of the branch to save the file (default to main)
     * @param {String} commitMessage The commit message (default to 'New update commit')
     * @returns {Promise}
     */
    updateFile: async function (
        path,
        content,
        branch = "main",
        commitMessage = "New Update Commit"
    ) {
        const lastCommitOfBranch = await this.getLastCommitSHA(branch);
        const { oid: fileSHA, content: oldContent } = await this.getFile(
            path,
            lastCommitOfBranch
        );

        return new Promise((resolve, reject) => {
            if (JSON.stringify(content) === JSON.stringify(oldContent))
                return reject(ERROR_CODES.DATA_NOT_CHANGE);

            this._updateContent(path, content, branch, commitMessage, fileSHA)
                .then((response) => {
                    const { path, sha, size } = response.data.content;
                    return resolve({ path, sha, size });
                })
                .catch((err) => {
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    /**
     * Check out to new branch
     * @param {String} newBranchName new branch name
     * @param {String} fromBranch which branch to branch out from
     * @returns {Promise} branch object { ref, object { sha } }
     */
    checkoutNewBranch: async function (newBranchName, fromBranch = "main") {
        const lastCommitSHA = await this.getLastCommitSHA(fromBranch);

        return new Promise((resolve, reject) => {
            const data = {
                ref: `refs/heads/${newBranchName}`,
                sha: lastCommitSHA,
            };

            GithubDB.post(`git/refs`, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    if (err.response) {
                        if (
                            err.response.status === 422 &&
                            err.response.data.message ===
                                "Reference already exists"
                        ) {
                            return reject(ERROR_CODES.BRANCH_EXISTED);
                        }

                        return reject(ERROR_CODES.GITHUB_API_ERROR);
                    }
                });
        });
    },
    /**
     * If branch exists, return its info, else create a new empty branch and return its info
     * @param {String} branchName new branch's name
     * @returns {Promise} branch object { ref, object { sha } }
     */
    createIfNotExist: async function (branchName) {
        const branches = await this.getAllBranches();
        const branch = branches.find((el) => el.name === branchName);

        if (branch) return branch;

        return new Promise((resolve, reject) => {
            this.checkoutNewBranch(branchName, "empty_branch")
                .then((data) => resolve(data))
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    /**
     * Delete a file
     * @param {String} path
     * @param {String} branch
     * @param {String} commitMessage
     * @returns {Promise}
     */
    deleteFile: async function (path, branch = "main", commitMessage = null) {
        const lastCommitOfBranch = await this.getLastCommitSHA(branch);
        const { oid: fileSHA } = await this.getFile(path, lastCommitOfBranch);

        return new Promise((resolve, reject) => {
            const data = {
                branch,
                message: commitMessage
                    ? commitMessage
                    : `Delete a file with path: "${path}"`,
                sha: fileSHA,
            };

            GithubDB.delete(`contents/${path}`, data)
                .then((response) => resolve(response.data))
                .catch((err) => {
                    console.log(err);
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    /**
     * Delete a branch, for security reason, branch "main" cannot be deleted
     * @param {String} branch Name of branch to delete
     * @returns {Promise} Success message
     */
    deleteBranch: function (branch) {
        return new Promise((resolve, reject) => {
            if (branch === "main") return reject(ERROR_CODES.DELETE_MAIN);

            GithubDB.delete(`git/refs/heads/${branch}`)
                .then((response) => {
                    resolve("Delete OK");
                })
                .catch((err) => {
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
    getATag: function (tagName) {
        const queryString = `
        query {
            repository(owner: "${owner}", name: "${repo}") {
                release(tagName: "${tagName}") {
                    name
                    tagName
                    createdAt
                }
            }
        }
        `;

        return new Promise((resolve, reject) => {
            GithubGraphQL(queryString)
                .then(async (response) => {
                    if (response.status !== 200) {
                        return reject(ERROR_CODES.GITHUB_API_ERROR);
                    }

                    if (!response.data.data)
                        return reject(ERROR_CODES.GITHUB_API_ERROR);

                    // Check content in result
                    console.log(response.data.data);
                })
                .catch((err) =>
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    )
                );
        });
    },
    tagACommit: async function (tagName, tagMessage = null, commitSHA = null) {
        const commit = commitSHA ? commitSHA : await this.getLastCommitSHA();
        const tagMsg = tagMessage
            ? tagMessage
            : `New tag created for commit: ${commit}`;

        const data = {
            tag: tagName,
            message: tagMsg,
            object: commit,
            type: "commit",
        };

        return new Promise((resolve, reject) => {
            GithubDB.post(`git/tags`, data)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    console.log(err);
                    reject(
                        err.response
                            ? ERROR_CODES.GITHUB_API_ERROR
                            : ERROR_CODES.UNKNOWN_ERROR
                    );
                });
        });
    },
};
