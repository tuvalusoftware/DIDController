const ERROR_CODES = {
    // Github API Error
    GITHUB_API_ERROR: {
        error_code: 1200,
        error_message: "Have-not-catch error given by github API.",
    },
    BAD_CREDENTIALS: {
        error_code: 1201,
        error_message: "Github Access Token is not provided or invalid.",
    },
    CONFLICT_PUSH: {
        error_code: 1202,
        error_message: "Asynchronous changes are pushed to the same branch.",
        cause: "Update/Create file",
    },
    BLOB_EXISTED: {
        error_code: 1203,
        error_message: "Blob (file) with the given name already exist.",
        cause: "Create a file",
    },
    BLOB_NOT_EXISTED: {
        error_code: 1204,
        error_message: "Blob (file) with the given name cannot be found.",
        cause: "Query a file",
    },
    FOLDER_NOT_EXISTED: {
        error_code: 1205,
        error_message: "Folder with the given name cannot be found.",
        cause: "Query a folder",
    },
    BRANCH_EXISTED: {
        error_code: 1206,
        error_message: "Branch with the given name already exist.",
        cause: "Create/Checkout new branch",
    },
    BRANCH_NOT_EXISTED: {
        error_code: 1207,
        error_message: "Branch with the given name cannot be found.",
        cause: "Query a branch",
    },
    REF_EXISTED: {
        error_code: 1208,
        error_message: "Reference already exist.",
        cause: "Create a tag/release. A tag with the same name already exist",
    },
    REF_NOT_EXISTED: {
        error_code: 1209,
        error_message: "Reference cannot be found.",
        cause: "Query/Delete a tag/release.",
    },
    DATA_NOT_CHANGE: {
        error_code: 1210,
        error_message: "Content of file has not changed.",
        cause: "Update a file",
    },
    DELETE_MAIN: {
        error_code: 1211,
        error_message: "Branch 'main' cannot be deleted.",
        cause: "Someone try to delete branch main",
    },
    INVALID_REF_NAME: {
        error_code: 1212,
        error_message:
            "Name is invalid (should be like v0.0.1 for tag/release and 'branch_name' for branch).",
        cause: "Create a tag or a release or a branch",
    },
    INVALID_GIT_OBJECT_ID: {
        error_code: 1213,
        error_message: "Git object ID provided is not valid.",
    },
    INVALID_WRAPPED_DOCUMENT: {
        error_code: 1214,
        error_message:
            "Invalid wrapped document. Could not find the owner's address.",
    },

    // Server Error (Human readable error messages)
    UNKNOWN_ERROR: {
        error_code: 10001,
        error_message: "Something went wrong!",
    },
    MISSING_PARAMETERS: {
        error_code: 10002,
        error_message:
            "Parameters in request body or header are missing. Please try again later.",
    },
    COMPANY_NOT_FOUND: {
        error_code: 10003,
        error_message: "Company with the given name cannot be found.",
    },
    FILE_NOT_FOUND: {
        error_code: 10004,
        error_message: "File/Public Key with the given value cannot be found.",
    },
    FILE_EXISTED: {
        error_code: 10005,
        error_message:
            "File or Public Key with the given value already exists.",
    },
    USER_DID_DOC_INVALID: {
        error_code: 10006,
        error_message:
            "Content of user's did doc is invalid. Please make sure all required fields are provided with their valid value.",
    },
    WRAP_DOC_DID_DOC_INVALID: {
        error_code: 10007,
        error_message:
            "Content of wrapped document's did doc is invalid. Please make sure all required fields are provided with their valid value.",
    },
    CREDENTIAL_INVALID: {
        error_code: 10008,
        error_message:
            "Content of credential is invalid. Please make sure all required fields are provided with their valid value.",
    },
    COMPANY_NAME_INVALID: {
        error_code: 10009,
        error_message:
            "Company name is invalid (Should not contain blank space).",
    },
};

const SUCCESS_CODES = {
    SAVE_SUCCESS: { message: "Successfully Saved" },
    CLONE_SUCCESS: { message: "Successfully Cloned" },
    UPDATE_SUCCESS: { message: "Successfully Updated" },
    DELETE_SUCCESS: { message: "Successfully Deleted" },
};

export { ERROR_CODES, SUCCESS_CODES };
