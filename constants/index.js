const ERROR_CODES = {
    // Github API Error
    GITHUB_API_ERROR: {
        errorCode: 1200,
        message: "Have-not-catch error given by github API.",
    },
    BAD_CREDENTIALS: {
        errorCode: 1201,
        message: "Github Access Token is not provided or invalid.",
    },
    CONFLICT_PUSH: {
        errorCode: 1202,
        message: "Asynchronous changes are pushed to the same branch.",
        cause: "Update/Create file",
    },
    BLOB_EXISTED: {
        errorCode: 1203,
        message: "Blob (file) with the given name already exist.",
        cause: "Create a file",
    },
    BLOB_NOT_EXISTED: {
        errorCode: 1204,
        message: "Blob (file) with the given name cannot be found.",
        cause: "Query a file",
    },
    FOLDER_NOT_EXISTED: {
        errorCode: 1205,
        message: "Folder with the given name cannot be found.",
        cause: "Query a folder",
    },
    BRANCH_EXISTED: {
        errorCode: 1206,
        message: "Branch with the given name already exist.",
        cause: "Create/Checkout new branch",
    },
    BRANCH_NOT_EXISTED: {
        errorCode: 1207,
        message: "Branch with the given name cannot be found.",
        cause: "Query a branch",
    },
    REF_EXISTED: {
        errorCode: 1208,
        message: "Reference already exist.",
        cause: "Create a tag/release. A tag with the same name already exist",
    },
    REF_NOT_EXISTED: {
        errorCode: 1209,
        message: "Reference cannot be found.",
        cause: "Query/Delete a tag/release.",
    },
    DATA_NOT_CHANGE: {
        errorCode: 1210,
        message: "Content of file has not changed.",
        cause: "Update a file",
    },
    DELETE_MAIN: {
        errorCode: 1211,
        message: "Branch 'main' cannot be deleted.",
        cause: "Someone try to delete branch main",
    },
    INVALID_REF_NAME: {
        errorCode: 1212,
        message: "Name is invalid (should be like v0.0.1).",
        cause: "Create a tag or a release",
    },
    INVALID_GIT_OBJECT_ID: {
        errorCode: 1213,
        message: "Git object ID provided is not valid.",
    },
    INVALID_WRAPPED_DOCUMENT: {
        errorCode: 1214,
        message:
            "Invalid wrapped document. Could not find the owner's address.",
    },

    // Server Error (Human readable error messages)
    UNKNOWN_ERROR: {
        errorCode: 10001,
        message: "Something went wrong!",
    },
    MISSING_PARAMETERS: {
        errorCode: 10002,
        message:
            "Parameters in request body or header are missing. Please try again later.",
    },
    COMPANY_NOT_FOUND: {
        errorCode: 10003,
        message: "Company with the given name cannot be found.",
    },
    FILE_NOT_FOUND: {
        errorCode: 10004,
        message: "File/Public Key with the given value cannot be found.",
    },
    FILE_EXISTED: {
        errorCode: 10005,
        message: "File or Public Key with the given value already exists.",
    },
    DID_CONTENT_INVALID: {
        errorCode: 10006,
        message:
            "Content of DID doc is invalid. Please make sure all required fields are provided with their valid value.",
    },
    CREDENTIAL_CONTENT_INVALID: {
        errorCode: 10007,
        message:
            "Content of credential is invalid. Please make sure all required fields are provided with their valid value.",
    },
    DID_DOC_CONTENT_INVALID: {
        errorCode: 10007,
        message:
            "Content of the did document is invalid. Please make sure all required fields are provided with their valid value.",
    },
};

const SUCCESS_CODES = {
    SAVE_SUCCESS: "Successfully Saved",
    UPDATE_SUCCESS: "Successfully Updated",
    DELETE_SUCCESS: "Successfully Deleted",
};
export { ERROR_CODES, SUCCESS_CODES };
