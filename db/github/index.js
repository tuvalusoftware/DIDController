import { ERROR_CODES, OPERATION_CODES } from "../../constants/index.js";
import Logger from "../../logger.js";
import { getFileExtension, tryParseStringToObj } from "../../utils/index.js";
import { executeGraphQL } from "./helpers.js";
import GithubRESTConfig from "./rest.js";

const owner = process.env.REPO_OWNER;

export default function (REPOSITORY) {
    const GithubREST = GithubRESTConfig(REPOSITORY);

    return {
        /**
         * @async
         * @description Get any object (blob, tree, commit) info from github using its SHA (Github ID)
         * @param {String} sha Git Object Id (could be blob, tree, commit)
         * @param {String} type Type of git object (default to 'blob')
         * @returns {Object} Git Object
         */
        get: function (sha, type = "blob") {
            Logger.functionInfo("db/github/index.js", "get");
            return new Promise((resolve, reject) => {
                GithubREST.get(`git/${encodeURI(type)}s/${encodeURI(sha)}`)
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
         * @async
         * @description Return repository's info
         * @returns {{ id: Number, name: String, full_name: String, private: Boolean, owner: { login: String, id: Number }, description: String|null, created_at: String, updated_at: String, size: Number, default_branch: String }} Repository Info
         */
        getRepoInfo: function () {
            Logger.functionInfo("db/github/index.js", "getRepoInfo");
            return new Promise((resolve, reject) => {
                GithubREST.get(``)
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
         * @async
         * @description Get the info of all branches from a repo
         * @returns {{ name: String, commit: { sha: String, url: String }, protected: Boolean }[]} An array of branch objects
         */
        getAllBranches: function () {
            Logger.functionInfo("db/github/index.js", "getAllBranches");
            return new Promise(async (resolve, reject) => {
                let all_branches = [];
                let current_page = 1;

                try {
                    while (true) {
                        const { data: branches_data } = await GithubREST.get(
                            `branches?per_page=100&page=${current_page}`
                        );

                        all_branches.push(...branches_data);

                        // All branches are already fetched
                        if (branches_data.length < 100) break;

                        current_page += 1;
                    }

                    resolve(all_branches);
                } catch (err) {
                    const errInfo = Logger.handleGithubError(err);
                    reject(errInfo);
                }
            });
        },

        /**
         * @async
         * @description Get info of a branch
         * @param {String} branchName
         * @returns {{ name: String, commit: { sha: String, url: String } }} Branch Object (there are other fields)
         */
        getBranchInfo: function (branchName = "main") {
            Logger.functionInfo("db/github/index.js", "getBranchInfo");
            return new Promise((resolve, reject) => {
                GithubREST.get(`branches/${encodeURI(branchName)}`)
                    .then((response) => {
                        const { name, commit } = response.data;
                        resolve({ name, commit });
                    })
                    .catch((err) => {
                        if (
                            err.response?.status === 404 &&
                            err.response?.data.message === "Branch not found"
                        ) {
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Set default branch for the repo
         * @param {String} branchName Default to main
         * @returns {{ id: Number, name: String, full_name: String, private: Boolean, owner: { login: String, id: Number }, description: String|null, created_at: String, updated_at: String, size: Number, default_branch: String }} Repository Info
         */
        setDefaultBranch: function (branchName = "main") {
            Logger.functionInfo("db/github/index.js", "setDefaultBranch");
            return new Promise((resolve, reject) => {
                GithubREST.patch(``, {
                    default_branch: branchName,
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((err) => {
                        if (
                            err.response?.status === 422 &&
                            err.response?.data.message === "Validation Failed"
                        ) {
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /* c8 ignore start */
        /**
         * @async
         * @description Perform Github Search API on a specific branch
         * @warning Only works perfectly on default branch, otherwise there is a significant delay because the Search API cannot detect the change on default branch
         * @reference https://docs.github.com/en/rest/search, https://docs.github.com/en/search-github/searching-on-github/searching-code, https://docs.github.com/en/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax
         * @param {String} queryString Query String for Github Search API (For example: 'Hello in:file repo:kazCTU1077/Fuixlabs_Document')
         * @returns {{ total_count: Number, incomplete_results: Boolean, items: { name: String, path: String, sha: String, text_matches: { fragment: String, matches: { text: String, indices: Number[] }[] }[] }[] }}
         */
        searchOnBranch: async function (queryString, branch = null) {
            Logger.functionInfo("db/github/index.js", "search");

            try {
                // Set default branch
                if (branch) {
                    await this.setDefaultBranch(branch);
                }

                const { data } = await GithubREST.search(queryString);
                return data;
            } catch (err) {
                const errInfo = Logger.handleGithubError(err);
                reject(errInfo);
            }
        },
        /* c8 ignore stop */

        /**
         * @async
         * @description Check out to new branch
         * @param {String} newBranchName new branch name
         * @param {String} fromBranch which branch to branch out from
         * @returns {{ name: String, commit: { sha: String, type: String, url: String } }} Branch object
         */
        checkoutNewBranch: async function (newBranchName, fromBranch = "main") {
            Logger.functionInfo("db/github/index.js", "checkoutNewBranch");
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
                        if (
                            err.response?.status === 422 &&
                            err.response?.data.message ===
                                "Reference already exists"
                        ) {
                            return reject(ERROR_CODES.BRANCH_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description If branch exists, return its info, else create a new empty branch and return its info
         * @param {String} branchName new branch's name
         * @returns {{ name: String, commit: { sha: String, url: String } }} Branch object
         */
        createBranchIfNotExist: async function (branchName) {
            Logger.functionInfo("db/github/index.js", "createBranchIfNotExist");
            try {
                const branch = await this.getBranchInfo(branchName);
                return branch;
            } catch (err) {
                if (err === ERROR_CODES.BRANCH_NOT_EXISTED) {
                    const branch = await this.checkoutNewBranch(
                        branchName,
                        "empty_branch"
                    );
                    return branch;
                }

                throw err;
            }
        },

        /**
         * @async
         * @description Delete a branch, for security reason, branch "main" cannot be deleted
         * @param {String} branch Name of branch to delete
         * @returns {{ message: String }} Success message
         */
        deleteBranch: function (branch) {
            Logger.functionInfo("db/github/index.js", "deleteBranch");
            return new Promise((resolve, reject) => {
                if (branch === "main")
                    return reject(ERROR_CODES.DELETE_MAIN_BRANCH);

                GithubREST.delete(`git/refs/heads/${branch}`)
                    .then((_) => {
                        resolve(OPERATION_CODES.DELETE_SUCCESS);
                    })
                    .catch((err) => {
                        if (
                            err.response?.data.message ===
                                "Reference does not exist" &&
                            err.response?.status === 422
                        ) {
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description If branch exists, delete that branch
         * @param {String} branchName new branch's name
         */
        deleteBranchIfExist: async function (branchName) {
            Logger.functionInfo("db/github/index.js", "deleteBranchIfExist");
            try {
                await this.deleteBranch(branchName);
            } catch (err) {
                if (err !== ERROR_CODES.BRANCH_NOT_EXISTED) throw err;
            }
        },

        /**
         * @async
         * @description Return the last commit SHA (id) of a branch
         * @param {String} branch Name of the branch (default to main)
         * @returns {String} SHA of the last commit
         */
        getBranchLastCommitSHA: function (branch = "main") {
            Logger.functionInfo("db/github/index.js", "getBranchLastCommitSHA");
            return new Promise((resolve, reject) => {
                GithubREST.get(`git/ref/heads/${encodeURI(branch)}`)
                    .then((response) => resolve(response.data.object.sha))
                    .catch((err) => {
                        if (
                            err.response?.status === 404 &&
                            err.response?.data.message === "Not Found"
                        ) {
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Get a list of commits of a branch or a file, along with cursor info for pagination
         * @param {Number} deep How far back to get commits
         * @param {String} branchName Name of the branch
         * @param {String} filePath If file path is provided, return the commit's history of that file only
         * @param {String} cursor Point at the commit to retrieve the previous commit
         * @returns {{ history: { oid: String, message: String, committedDate: String }[], totalCount: Number, pageInfo: { endCursor: String, hasNextPage: Boolean } }} An object contains list of branch, total of commits, the cursor to start (to start at which commit)
         */
        _getCommitHistory: function (
            deep = 5,
            branchName = "main",
            filePath = null,
            cursor = null
        ) {
            Logger.functionInfo("db/github/index.js", "_getCommitHistory");
            return new Promise((resolve, reject) => {
                const fileExpr = filePath ? `path: "${filePath}"` : "";
                const pagination = cursor ? `after: "${cursor}"` : "";

                const queryString = `
                {
                    repository(owner: "${owner}", name: "${REPOSITORY}") {
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

                executeGraphQL(queryString)
                    .then((res) => {
                        if (res.data.errors) {
                            const errInfo = Logger.handleGithubError(
                                res.data.errors
                            );
                            return reject(errInfo);
                        }

                        if (!res.data.data?.repository?.branch)
                            return reject(ERROR_CODES.BRANCH_NOT_EXISTED);

                        const { totalCount, pageInfo } =
                            res.data.data.repository.branch.target.history;

                        // If there is no commits, file is not exists
                        if (totalCount === 0)
                            return reject(ERROR_CODES.BLOB_NOT_EXISTED);

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
         * @async
         * @description Get a list of commits of a branch or a file
         * @param {Number} deep How far back to get commits
         * @param {String} branchName Name of the branch
         * @param {String} filePath If file path is provided, return the commit's history of that file only
         * @returns {{ oid: String, message: String, committedDate: String }[]} Array of commits object
         */
        getCommitHistory: function (
            deep = 5,
            branchName = "main",
            filePath = null
        ) {
            Logger.functionInfo("db/github/index.js", "getCommitHistory");
            return new Promise(async (resolve, reject) => {
                let numElements = deep;
                let results = [];
                let cursor = null;

                try {
                    while (numElements > 0) {
                        const { history, pageInfo } =
                            await this._getCommitHistory(
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
         * @async
         * @description Get the latest commit of a file
         * @param {String} branchName Name of the branch (default to 'main')
         * @param {String} filePath
         * @returns {{ oid: String, message: String, committedDate: String }} Commit Object
         */
        getFileLatestCommit: function (branchName = "main", filePath) {
            Logger.functionInfo("db/github/index.js", "getFileLatestCommit");
            return new Promise((resolve, reject) => {
                this.getCommitHistory(1, branchName, filePath)
                    .then((response) => {
                        resolve(response[0]);
                    })
                    .catch((err) => reject(err));
            });
        },

        /**
         * @async
         * @description Check if file exists on repo
         * @param {String} fileName name (path) of file
         * @param {String} branchName name (default to main) of the branch
         * @returns {Boolean}
         */
        isExistedFile: function (fileName = "", branchName = "main") {
            Logger.functionInfo("db/github/index.js", "isExistedFile");
            return new Promise((resolve, reject) => {
                GithubREST.get(
                    `contents/${encodeURI(fileName)}?ref=${encodeURI(
                        branchName
                    )}`
                )
                    .then((response) =>
                        response.data ? resolve(true) : resolve(false)
                    )
                    .catch((err) => {
                        if (
                            err.response?.status === 404 &&
                            err.response?.data.message === "Not Found"
                        )
                            return resolve(false);

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Return the content as a string (mostly base64 encoded e.g image, pdf, ...) of file from repository
         * @param {String} fileSHA SHA (id) string of a file
         * @returns {String}
         */
        getFileAsBinary: function (fileSHA) {
            Logger.functionInfo("db/github/index.js", "getFileAsBinary");
            return new Promise((resolve, reject) => {
                GithubREST.get(`git/blobs/${encodeURI(fileSHA)}`)
                    .then((response) => resolve(response.data.content))
                    .catch((err) => {
                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Return info of a file object
         * @param {String} filePath Path of the file
         * @param {String} commitSHA SHA of a commit, default to HEAD which is the last commit
         * @returns {{ text: String, byteSize: Number, oid: String, isBinary: Boolean, content: Object }}
         */
        getFile: function (filePath, commitSHA = "HEAD") {
            Logger.functionInfo("db/github/index.js", "getFile");
            const queryString = `
                query RepoFiles {
                    repository(owner: "${owner}", name: "${REPOSITORY}") {
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
                executeGraphQL(queryString)
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

                            // Parse content to JS object if data is a text file (e.g: json)
                            data.content = data.isBinary
                                ? await this.getFileAsBinary(data.oid)
                                : tryParseStringToObj(data.text);

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
         * @async
         * @description Return different version of a file through its commit
         * @param {String} filePath Path of the file
         * @param {String} branchName name of the branch that contains the file
         * @returns {Object[]}
         */
        getFileHistory: async function (filePath, branchName = "main") {
            Logger.functionInfo("db/github/index.js", "getFileHistory");
            let commits = [];
            let cursor = null;
            const commitsPerQuery = 100;

            while (true) {
                const { history, pageInfo } = await this._getCommitHistory(
                    commitsPerQuery,
                    branchName,
                    filePath,
                    cursor
                );

                commits = [...commits, ...history];
                if (!pageInfo.hasNextPage) break;

                cursor = pageInfo.endCursor;
            }

            // Loop through all the commits to get file content
            const getFileOperations = commits.map((el) =>
                this.getFile(filePath, el.oid)
            );

            const data = await Promise.all(getFileOperations);
            const fileHistory = data.map((el) => el.content);
            return fileHistory;
        },

        /**
         * @async
         * @description Return all files from a folder of a repo
         * @param {String} treePath folder's path (default to an empty string - which mean the root folder of a repo)
         * @param {Boolean} allowFolder if true, the returns result will also include nested folder (default to true)
         * @param {String} commitSHA SHA of a commit, default to HEAD which is the last commit
         * @param {Boolean} includeContent if true, the returns result will also include the content of each file
         * @returns {{ name: String, type: String, mode: Number, object: { byteSize: Number, text: String, isBinary: Boolean, oid: String }}[]} Array of files (or folders)' info in a tree path
         */
        getFilesOfTree: function (
            treePath = "",
            allowFolder = true,
            commitSHA = "HEAD",
            includeContent = false
        ) {
            Logger.functionInfo("db/github/index.js", "getFilesOfTree");
            const includeContentQuery = includeContent
                ? ` object {
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
                    repository(owner: "${owner}", name: "${REPOSITORY}") {
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
                executeGraphQL(queryString)
                    .then((response) => {
                        if (response.data.errors) {
                            const errInfo = Logger.handleGithubError(
                                response.data.errors
                            );
                            return reject(errInfo);
                        }

                        const responseData =
                            response.data.data?.repository?.object;
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
         * @async
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
            Logger.functionInfo("db/github/index.js", "_updateContent");
            const contentData =
                typeof content === "string"
                    ? content
                    : new Buffer.from(JSON.stringify(content)).toString(
                          "base64"
                      );

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
         * @async
         * @description Create and save a new file to Repo
         * @param {String} path Path of a new file
         * @param {Object} content Content of a new file
         * @param {String} branch Name of the branch to save the file (default to main)
         * @param {String} commitMessage The commit message (default to 'New commit')
         * @returns {{ path: String, sha: String, size: Number }}
         */
        createNewFile: function (
            path,
            content,
            branch = "main",
            commitMessage = "CREATE a file"
        ) {
            Logger.functionInfo("db/github/index.js", "createNewFile");
            return new Promise((resolve, reject) => {
                this._updateContent(path, content, branch, commitMessage)
                    .then((response) => {
                        const { path, sha, size } = response.data.content;
                        return resolve({ path, sha, size });
                    })
                    .catch((err) => {
                        if (
                            err.response?.status === 422 &&
                            err.response?.data.message ===
                                `Invalid request.\n\n"sha" wasn't supplied.`
                        ) {
                            return reject(ERROR_CODES.BLOB_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Update and save a file to Repo
         * @param {String} path Path of a file
         * @param {Object} content Content of a file
         * @param {String} branch Name of the branch to save the file (default to main)
         * @param {String} commitMessage The commit message (default to 'New update commit')
         * @returns {{ path: String, sha: String, size: Number }}
         */
        updateFile: async function (
            path,
            content,
            branch = "main",
            commitMessage = "UPDATE a file"
        ) {
            Logger.functionInfo("db/github/index.js", "updateFile");
            const lastCommitOfBranch = await this.getBranchLastCommitSHA(
                branch
            );
            const { oid: fileSHA, content: oldContent } = await this.getFile(
                path,
                lastCommitOfBranch
            );

            return new Promise((resolve, reject) => {
                if (JSON.stringify(content) === JSON.stringify(oldContent))
                    return reject(ERROR_CODES.DATA_NOT_CHANGE);

                this._updateContent(
                    path,
                    content,
                    branch,
                    commitMessage,
                    fileSHA
                )
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
         * @async
         * @description Delete a file from a repo
         * @param {String} path
         * @param {String} branch
         * @param {String} commitMessage
         * @returns {{ message: String }}
         */
        deleteFile: async function (
            path,
            branch = "main",
            commitMessage = null
        ) {
            Logger.functionInfo("db/github/index.js", "deleteFile");
            const lastCommitOfBranch = await this.getBranchLastCommitSHA(
                branch
            );
            const { oid: fileSHA } = await this.getFile(
                path,
                lastCommitOfBranch
            );

            return new Promise((resolve, reject) => {
                const data = {
                    branch,
                    message: commitMessage
                        ? commitMessage
                        : `DELETE a file with path: "${path}"`,
                    sha: fileSHA,
                };

                GithubREST.delete(`contents/${path}`, data)
                    .then((_) => resolve(OPERATION_CODES.DELETE_SUCCESS))
                    .catch((err) => {
                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Query first 100 tags with GraphQL Github API
         * @param {String} cursor indicates where the cursor is in the array
         * @ref: https://docs.github.com/en/graphql/reference/enums#reforderfield
         * @returns {Object} An object contains list of tags, { endCursor, hasNextPage }
         */
        _getAllTags: function (cursor = null) {
            const pagination = cursor ? `after: "${cursor}"` : "";

            const queryString = `
                query {
                    repository(owner: "${owner}", name: "${REPOSITORY}") {
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
                executeGraphQL(queryString)
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
         * @async
         * @description Query all tags
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
         * @async
         * @description Query a tag
         * @param {String} tagName name of the tag
         * @returns {Object} { tagName, target: { oid, commitUrl } }
         */
        getATag: function (tagName) {
            return new Promise((resolve, reject) => {
                GithubREST.get(`git/matching-refs/tags/${encodeURI(tagName)}`)
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
         * @async
         * @description Create a tag by pointing to a commit
         * @param {String} tagName name of the tag
         * @param {String} sha git object id (could be commit, blob, tree)
         * @returns {Object} Tag object
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
         * @async
         * @description Delete a tag
         * @param {String} tagName name of the tag
         * @returns {{ message }} 'Delete success'
         */
        deleteATag: function (tagName) {
            return new Promise((resolve, reject) => {
                GithubREST.delete(`git/refs/tags/${tagName}`)
                    .then((_) => {
                        resolve(OPERATION_CODES.DELETE_SUCCESS);
                    })
                    .catch((err) => {
                        if (
                            err.response?.data.message ===
                                "Reference does not exist" &&
                            err.response?.status === 422
                        ) {
                            return reject(ERROR_CODES.REF_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Create a release by pointing to a commit
         * Releases are GitHub's way of packaging and providing software to your users. You can think of it as a replacement to using downloads to provide software.
         * @param {String} tagName name of the tag
         * @param {String} message message for the release
         * @param {String} commitSHA commit ID
         * @returns {Object} Release object
         */
        tagCommitAsRelease: async function (
            tagName,
            message = null,
            commitSHA = null
        ) {
            const sha = commitSHA
                ? commitSHA
                : await this.getBranchLastCommitSHA();

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
         * @async
         * @description Create a release by its tag name
         * @param {String} tagName name of the tag
         * @returns {Object} Release object
         */
        getARelease: function (tagName) {
            return new Promise((resolve, reject) => {
                GithubREST.get(`releases/tags/${encodeURI(tagName)}`)
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
                            err.response?.status === 404 &&
                            err.response?.data.message === "Not Found"
                        ) {
                            return reject(ERROR_CODES.REF_NOT_EXISTED);
                        }

                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Get all releases of the repo
         * @returns {Array} Release object
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
                        const errInfo = Logger.handleGithubError(err);
                        reject(errInfo);
                    });
            });
        },

        /**
         * @async
         * @description Delete a tag
         * @param {String} tagName name of the tag
         * @returns {{ message }} 'Delete success'
         */
        deleteRelease: async function (tagName) {
            try {
                const { id: tagId } = await this.getARelease(tagName);

                // Delete both the release and its tag
                await Promise.all([
                    GithubREST.delete(`releases/${tagId}`),
                    this.deleteATag(tagName),
                ]);

                return OPERATION_CODES.DELETE_SUCCESS;
            } catch (err) {
                if (
                    err.response?.data.message === "Reference does not exist" &&
                    err.response?.status === 422
                ) {
                    throw ERROR_CODES.REF_NOT_EXISTED;
                }

                const errInfo = Logger.handleGithubError(err);
                throw errInfo;
            }
        },
    };
}
