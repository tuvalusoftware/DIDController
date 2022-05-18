const ERROR_CODES = {
    UNKNOWN_ERROR: {
        errorCode: 1200,
        errorMessage: "Something went wrong!",
    },
    GITHUB_API_ERROR: {
        errorCode: 1201,
        errorMessage: "Have-not-catch error given by github API.",
    },
    CONFLICT_PUSH: {
        errorCode: 1202,
        errorMessage: "Asynchronous changes are pushed to the same branch.",
        cause: "Update/Create file",
    },
    FILE_EXISTED: {
        errorCode: 1203,
        errorMessage: "File with the given name already exist.",
        cause: "Create a file",
    },
    FILE_NOT_EXISTED: {
        errorCode: 1204,
        errorMessage: "File with the given name cannot be found.",
        cause: "Query a file",
    },
    FOLDER_NOT_EXISTED: {
        errorCode: 1205,
        errorMessage: "Folder with the given name cannot be found.",
        cause: "Query a folder",
    },
    BRANCH_EXISTED: {
        errorCode: 1206,
        errorMessage: "Branch with the given name already exist.",
        cause: "Create/Checkout new branch",
    },
    BRANCH_NOT_EXISTED: {
        errorCode: 1207,
        errorMessage: "Branch with the given name cannot be found.",
        cause: "Query a branch",
    },
    REF_EXISTED: {
        errorCode: 1208,
        errorMessage: "Reference is already exist.",
        cause: "Create a tag. A tag with the same name already exist",
    },
    REF_NOT_EXISTED: {
        errorCode: 1209,
        errorMessage: "Reference cannot be found.",
        cause: "Query/Delete a tag.",
    },
    DATA_NOT_CHANGE: {
        errorCode: 1210,
        errorMessage: "Content of file has not changed.",
        cause: "Update a file",
    },
    DELETE_MAIN: {
        errorCode: 1211,
        errorMessage: "Branch 'main' cannot be deleted.",
        cause: "Someone try to delete branch main",
    },
    MISSING_PARAMETERS: {
        errorCode: 1212,
        errorMessage:
            "Parameters in request body are missing. Please try again later.",
        cause: "Post request.",
    },
};

export { ERROR_CODES };
