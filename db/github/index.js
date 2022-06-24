import dotenv from "dotenv";
dotenv.config();

import GithubREST from "./rest.js";
import GithubGraphQL from "./graphql.js";
import Logger from "../../logger.js";
import { tryParse, getFileExtension } from "../../utils/index.js";
import { ERROR_CODES, SUCCESS_CODES } from "../../constants/index.js";

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

export default {
    /**
     *
     * @param {String} sha Git Object Id (could be blob, tree, commit)
     * @param {String} type Type of git object (default to 'blob')
     * @returns {Object} Information of a git object
     */
    get: function (sha, type = "blob") {
        return new Promise((resolve, reject) => {
            GithubREST.get(`git/${type}s/${sha}`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Get the info of all branches from a repo
     * @returns {Promise} All branches from a repo
     */
    getAllBranches: function () {
        return new Promise((resolve, reject) => {
            GithubREST.get(`branches`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Get info of a branch
     * @param {String} branchName
     * @returns {Object} check if branch is exist and return the branch object
     */
    getBranchInfo: function (branchName = "main") {
        return new Promise((resolve, reject) => {
            GithubREST.get(`branches/${branchName}`)
                .then((response) => {
                    const { name, commit } = response.data;
                    resolve({ name, commit });
                })
                .catch((err) => {
                    if (err.response) {
                        if (
                            err.response.status === 404 &&
                            err.response.data.message === "Branch not found"
                        ) {
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                        }
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Check out to new branch
     * @param {String} newBranchName new branch name
     * @param {String} fromBranch which branch to branch out from
     * @returns {Promise} branch object { ref, object { sha } }
     */
    checkoutNewBranch: async function (newBranchName, fromBranch = "main") {
        const lastCommitSHA = await this.getBranchLastCommitSHA(fromBranch);

        return new Promise((resolve, reject) => {
            const data = {
                ref: `refs/heads/${newBranchName}`,
                sha: lastCommitSHA,
            };

            GithubREST.post(`git/refs`, data)
                .then((res) => {
                    const { ref, object: commit } = res.data;

                    if (ref.includes(newBranchName)) {
                        return resolve({ name: newBranchName, commit });
                    }

                    throw ERROR_CODES.GITHUB_API_ERROR;
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
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description If branch exists, return its info, else create a new empty branch and return its info
     * @param {String} branchName new branch's name
     * @returns {Promise} branch object { ref, object { sha } }
     */
    createBranchIfNotExist: async function (branchName) {
        const branches = await this.getAllBranches();
        const branch = branches.find((el) => el.name === branchName);

        if (branch) return branch;

        return new Promise((resolve, reject) => {
            this.checkoutNewBranch(branchName, "empty_branch")
                .then((data) => resolve(data))
                .catch((err) => {
                    reject(err);
                });
        });
    },
    /**
     * @description Delete a branch, for security reason, branch "main" cannot be deleted
     * @param {String} branch Name of branch to delete
     * @returns {Promise} Success message
     */
    deleteBranch: function (branch) {
        return new Promise((resolve, reject) => {
            if (branch === "main") return reject(ERROR_CODES.DELETE_MAIN);

            GithubREST.delete(`git/refs/heads/${branch}`)
                .then((_) => {
                    resolve(SUCCESS_CODES.DELETE_SUCCESS);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description If branch exists, delete that branch
     * @param {String} branchName new branch's name
     */
    deleteBranchIfExist: async function (branchName) {
        const branches = await this.getAllBranches();
        const branch = branches.find((el) => el.name === branchName);

        if (!branch) return;
        await this.deleteBranch(branchName);
    },
    /**
     * @description Return the last commit SHA (id) of a branch
     * @param {string} branch Name of the branch (default to main)
     * @returns {string}
     */
    getBranchLastCommitSHA: function (branch = "main") {
        return new Promise((resolve, reject) => {
            GithubREST.get(`git/ref/heads/${branch}`)
                .then((response) => resolve(response.data.object.sha))
                .catch((err) => {
                    if (err.response?.status === 404) {
                        return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Get a list of commits of a branch or a file, along with cursor info for pagination
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

            GithubGraphQL.execute(queryString)
                .then((res) => {
                    if (res.data.errors) {
                        const errInfo = Logger.handleGithubError(
                            res.data.errors
                        );
                        return reject(errInfo);
                    }

                    if (!res.data.data.repository.branch) {
                        return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                    }

                    const { totalCount, pageInfo } =
                        res.data.data.repository.branch.target.history;

                    const history =
                        res.data.data.repository.branch.target.history.edges.map(
                            (el) => ({ ...el.node })
                        );

                    resolve({ history, totalCount, pageInfo });
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Get a list of commits of a branch or a file
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
                    const { history, pageInfo } = await this._getCommitHistory(
                        numElements <= 100 ? numElements : 100,
                        branchName,
                        filePath,
                        cursor
                    );

                    results = [...results, ...history];
                    if (!pageInfo.hasNextPage) break;

                    cursor = pageInfo.endCursor;
                    numElements -= 100;
                }

                resolve(results);
            } catch (err) {
                reject(err);
            }
        });
    },
    /**
     * @description Get the latest commit of a file
     * @param {String} branchName Name of the branch (default to 'main')
     * @param {String} filePath
     * @returns {Promise} Latest commit object
     */
    getLatestCommit: function (branchName = "main", filePath) {
        return new Promise((resolve, reject) => {
            this.getCommitHistory(1, branchName, filePath)
                .then((response) => {
                    resolve(response[0]);
                })
                .catch((err) => reject(err));
        });
    },
    /**
     * @description Check if file exists on repo
     * @param {String} fileName name (path) of file
     * @param {String} branchName name (default to main) of the branch
     * @returns {Boolean}
     */
    isExistedFile: function (fileName = "", branchName = "main") {
        return new Promise((resolve, reject) => {
            GithubREST.get(`contents/${fileName}?ref=${branchName}`)
                .then((response) =>
                    response.data ? resolve(true) : resolve(false)
                )
                .catch((err) => {
                    if (
                        err.response.status === 404 &&
                        err.response.data.message === "Not Found"
                    )
                        return resolve(false);

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Return the content as a string (mostly base64 encoded) of file from repository
     * @param {String} fileSHA SHA (id) string of a file
     * @returns {String}
     */
    getBinaryFile: function (fileSHA) {
        return new Promise((resolve, reject) => {
            GithubREST.get(`git/blobs/${fileSHA}`)
                .then((response) => resolve(response.data.content))
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
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
            GithubGraphQL.execute(queryString)
                .then(async (response) => {
                    if (response.status !== 200 || !response.data.data) {
                        const errInfo = Logger.handleGithubError(err);
                        return reject(errInfo);
                    }

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
                            ? await this.getBinaryFile(data.oid)
                            : tryParse(data.text);

                        resolve(data);
                    } else reject(ERROR_CODES.BLOB_NOT_EXISTED);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Return different version of a file through its commit
     * @param {String} filePath Path of the file
     * @param {String} branchName name of the branch that contains the file
     * @returns {Promise}
     */
    getFileHistory: async function (filePath, branchName = "main") {
        let commits = [];
        let total = 0;
        let cursor = null;
        const commitsPerQuery = 100;

        while (true) {
            const { history, totalCount, pageInfo } =
                await this._getCommitHistory(
                    commitsPerQuery,
                    branchName,
                    filePath,
                    cursor
                );

            commits = [...commits, ...history];
            total = totalCount;
            if (!pageInfo.hasNextPage) break;

            cursor = pageInfo.endCursor;
        }

        const getFileOperations = commits.map((el) =>
            this.getFile(filePath, el.oid)
        );

        const data = await Promise.all(getFileOperations);
        const fileHistory = data.map((el) => el.content);
        return { total, history: fileHistory };
    },
    /**
     * @description Return all files from a folder of a repo
     * @param {String} treePath folder's path (default to an empty string - which mean the root folder of a repo)
     * @param {Boolean} allowFolder if true, the returns result will also include nested folder (default to true)
     * @param {String} commitSHA SHA of a commit, default to HEAD which is the last commit
     * @param {Boolean} includeContent if true, the returns result will also include the content of each file
     * @returns {Array} Array of files (or folders)' info in a tree path
     */
    getFilesOfTree: function (
        treePath = "",
        allowFolder = true,
        commitSHA = "HEAD",
        includeContent = false
    ) {
        const includeContentQuery = includeContent
            ? `object {
            ... on Blob {
                byteSize
                text
                isBinary
                oid
            }
        }`
            : "";

        const queryString = `
        query RepoFiles {
            repository(owner: "${owner}", name: "${repo}") {
                object(expression: "${commitSHA}:${treePath}") {
                    ... on Tree {
                        entries {
                            name
                            type
                            mode

                            ${includeContentQuery}
                        }
                    }
                }
            }
        }  
        `;

        return new Promise((resolve, reject) => {
            GithubGraphQL.execute(queryString)
                .then((response) => {
                    if (response.data.errors) {
                        const errInfo = Logger.handleGithubError(
                            response.data.errors
                        );
                        return reject(errInfo);
                    }

                    const responseData = response.data.data.repository.object;
                    if (
                        (responseData &&
                            Object.keys(responseData).length === 0 &&
                            Object.getPrototypeOf(responseData) ===
                                Object.prototype) ||
                        !responseData
                    )
                        reject(ERROR_CODES.FOLDER_NOT_EXISTED);
                    else {
                        const results = allowFolder
                            ? responseData.entries
                            : responseData.entries.filter(
                                  (obj) => obj.type === "blob"
                              );

                        resolve(results);
                    }
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
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

        return GithubREST.put(`contents/${path}`, data);
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
                        if (err.response.status === 422)
                            return reject(ERROR_CODES.BLOB_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
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
        const lastCommitOfBranch = await this.getBranchLastCommitSHA(branch);
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
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Delete a file from a repo
     * @param {String} path
     * @param {String} branch
     * @param {String} commitMessage
     * @returns {Promise}
     */
    deleteFile: async function (path, branch = "main", commitMessage = null) {
        const lastCommitOfBranch = await this.getBranchLastCommitSHA(branch);
        const { oid: fileSHA } = await this.getFile(path, lastCommitOfBranch);

        return new Promise((resolve, reject) => {
            const data = {
                branch,
                message: commitMessage
                    ? commitMessage
                    : `Delete a file with path: "${path}"`,
                sha: fileSHA,
            };

            GithubREST.delete(`contents/${path}`, data)
                .then((response) => resolve(SUCCESS_CODES.DELETE_SUCCESS))
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Query first 100 tags with GraphQL Github API
     * @param {String} cursor element that the cursor point to after retrieve the last element
     * @ref: https://docs.github.com/en/graphql/reference/enums#reforderfield
     * @returns {Promise} An object contains list of tags, { endCursor, hasNextPage }
     */
    _getAllTags: function (cursor = null) {
        const pagination = cursor ? `after: "${cursor}"` : "";

        const queryString = `
        query {
            repository(owner: "${owner}", name: "${repo}") {
                refs(refPrefix: "refs/tags/", first: 100, orderBy: { field: ALPHABETICAL, direction: DESC}, ${pagination}) {
                    edges {
                        node {
                            name
                            target {
                                oid
                                commitUrl
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
        `;

        return new Promise((resolve, reject) => {
            GithubGraphQL.execute(queryString)
                .then((response) => {
                    if (response.data.errors) {
                        const errInfo = Logger.handleGithubError(
                            response.data.errors
                        );
                        return reject(errInfo);
                    }

                    // Check content in result
                    let results = response.data.data.repository.refs.edges;
                    results = results.map((el) => el.node);

                    const pageInfo =
                        response.data.data.repository.refs.pageInfo;

                    resolve({ results, pageInfo });
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * Query all tags
     * @ref: https://docs.github.com/en/graphql/reference/enums#reforderfield
     * @returns {Array} array of tags
     */
    getAllTags: async function () {
        let results = [];
        let cursor = null;

        try {
            while (true) {
                const { results: tags, pageInfo } = await this._getAllTags(
                    cursor
                );
                results = [...results, ...tags];

                if (!pageInfo.hasNextPage) break;

                cursor = pageInfo.endCursor;
            }

            return results;
        } catch (err) {
            const errInfo = Logger.handleGithubError(err);
            throw errInfo;
        }
    },
    /**
     * Query a tag
     * @param {String} tagName name of the tag
     * @returns {Object} { tagName, target: { oid, commitUrl } }
     */
    getATag: function (tagName) {
        return new Promise((resolve, reject) => {
            GithubREST.get(`git/matching-refs/tags/${tagName}`)
                .then((response) => {
                    const { length } = response.data;

                    if (!length) reject(ERROR_CODES.REF_NOT_EXISTED);
                    resolve(response.data[0]);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * Create a tag by pointing to a commit
     * @param {String} tagName name of the tag
     * @param {String} sha git object id (could be commit, blob, tree)
     * @returns {Promise} Tag object
     */
    tag: async function (tagName, sha) {
        const data = {
            ref: `refs/tags/${tagName}`,
            sha,
        };

        return new Promise((resolve, reject) => {
            GithubREST.post(`git/refs`, data)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * Delete a tag
     * @param {String} tagName name of the tag
     * @returns {Promise} 'Delete success'
     */
    deleteATag: function (tagName) {
        return new Promise((resolve, reject) => {
            GithubREST.delete(`git/refs/tags/${tagName}`)
                .then((_) => {
                    resolve(SUCCESS_CODES.DELETE_SUCCESS);
                })
                .catch((err) => {
                    if (
                        err.response.data.message ===
                            "Reference does not exist" &&
                        err.response.status === 422
                    ) {
                        return reject(ERROR_CODES.REF_NOT_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * Create a release by pointing to a commit
     * @param {String} tagName name of the tag
     * @param {String} message message for the release
     * @param {String} commitSHA commit ID
     * @returns {Promise} Release object
     */
    tagCommitAsRelease: async function (
        tagName,
        message = null,
        commitSHA = null
    ) {
        const sha = commitSHA ? commitSHA : await this.getBranchLastCommitSHA();

        const data = {
            tag_name: tagName,
            target_commitish: sha,
            body: message ? message : `Release at commit ${sha}`,
        };

        return new Promise((resolve, reject) => {
            GithubREST.post(`releases`, data)
                .then(({ data }) => {
                    const {
                        html_url,
                        id,
                        tag_name,
                        target_commitish,
                        body,
                        created_at,
                    } = data;
                    resolve({
                        html_url,
                        id,
                        tag_name,
                        target_commitish,
                        body,
                        created_at,
                    });
                })
                .catch((err) => {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * Create a release by its tag name
     * @param {String} tagName name of the tag
     * @returns {Promise} Release object
     */
    getARelease: function (tagName) {
        return new Promise((resolve, reject) => {
            GithubREST.get(`releases/tags/${tagName}`)
                .then(({ data }) => {
                    const {
                        html_url,
                        id,
                        tag_name,
                        target_commitish,
                        body,
                        created_at,
                    } = data;

                    resolve({
                        html_url,
                        id,
                        tag_name,
                        target_commitish,
                        body,
                        created_at,
                    });
                })
                .catch((err) => {
                    if (
                        err.response?.status === 422 &&
                        err.response?.data.message
                    ) {
                        return reject(ERROR_CODES.REF_EXISTED);
                    }

                    if (err.response.status === 404) {
                        return reject(ERROR_CODES.REF_NOT_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Get all releases of the repo
     * @returns {Promise} Release object
     */
    getAllReleases: function () {
        return new Promise((resolve, reject) => {
            GithubREST.get(`releases`)
                .then(({ data }) => {
                    const results = data.map((el) => {
                        const {
                            html_url,
                            id,
                            tag_name,
                            target_commitish,
                            body,
                            created_at,
                        } = el;

                        return {
                            html_url,
                            id,
                            tag_name,
                            target_commitish,
                            body,
                            created_at,
                        };
                    });

                    resolve(results);
                })
                .catch((err) => {
                    if (
                        err.response?.status === 422 &&
                        err.response?.data.message
                    ) {
                        return reject(ERROR_CODES.REF_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
    /**
     * @description Delete a tag
     * @param {String} tagName name of the tag
     * @returns {Promise} 'Delete success'
     */
    deleteRelease: async function (tagName) {
        const { id: tagId } = await this.getARelease(tagName);

        return new Promise((resolve, reject) => {
            GithubREST.delete(`releases/${tagId}`)
                .then((_) => {
                    resolve(SUCCESS_CODES.DELETE_SUCCESS);
                })
                .catch((err) => {
                    if (
                        err.response.data.message ===
                            "Reference does not exist" &&
                        err.response.status === 422
                    ) {
                        return reject(ERROR_CODES.REF_NOT_EXISTED);
                    }

                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                });
        });
    },
};
