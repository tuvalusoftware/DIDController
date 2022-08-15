const SERVICES = {
    AUTH: `http://18.139.84.180:12000`,
    AUTH_HTTPS: `https://auth-fuixlabs.ap.ngrok.io`,
};

const ERROR_CODES = {
    // Github API Error
    GITHUB_API_ERROR: {
        error_code: 1200,
        error_message: "Unexpected Storage Error.",
        error_cause:
            "Potential Errors: invalid repository name, invalid github auth token, ... Or any other unexpected error given by Github API.",
    },
    BAD_CREDENTIALS: {
        error_code: 1201,
        error_message: "Github Access Token is not provided or invalid.",
    },
    CONFLICT_PUSH: {
        error_code: 1202,
        error_message: "Asynchronous changes are pushed to the same branch.",
        error_cause:
            "Update/Create/Delete file or any modification regard to commits on a same branch at the same time.",
    },
    BLOB_EXISTED: {
        error_code: 1203,
        error_message: "Blob (file) with the given name already exist.",
    },
    BLOB_NOT_EXISTED: {
        error_code: 1204,
        error_message: "Blob (file) with the given name cannot be found.",
    },
    FOLDER_NOT_EXISTED: {
        error_code: 1205,
        error_message: "Folder with the given name cannot be found.",
    },
    BRANCH_EXISTED: {
        error_code: 1206,
        error_message: "Branch with the given name already exist.",
        error_cause: "Create/Checkout new branch",
    },
    BRANCH_NOT_EXISTED: {
        error_code: 1207,
        error_message: "Branch with the given name cannot be found.",
    },
    REF_EXISTED: {
        error_code: 1208,
        error_message: "Reference already exist.",
        error_cause:
            "Create a tag/release. A tag with the same name already exist",
    },
    REF_NOT_EXISTED: {
        error_code: 1209,
        error_message: "Reference cannot be found.",
        error_cause: "Query/Delete a tag/release.",
    },
    DATA_NOT_CHANGE: {
        error_code: 1210,
        error_message: "Content of file has not changed.",
        error_cause: "Update a file",
    },
    DELETE_MAIN_BRANCH: {
        error_code: 1211,
        error_message: "Branch 'main' cannot be deleted.",
        error_cause: "Someone try to delete branch main",
    },
    INVALID_REF_NAME: {
        error_code: 1212,
        error_message:
            "Name is invalid (should be like v0.0.1 for tag/release and 'branch_name' for branch).",
        error_cause: "Create a tag or a release or a branch",
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

    // Common Errors
    UNKNOWN_ERROR: {
        error_code: 10000,
        error_message: "Something went wrong with the server!",
    },
    SECURITY_SERVICE_AUTHENTICATION: {
        error_code: 10001,
        error_message: "Unauthorized.",
        error_cause:
            "Invalid authentication info according to the Security Service",
    },
    MISSING_ACCESS_TOKEN: {
        error_code: 10003,
        error_message: "Unauthorized.",
        error_cause: "Access token is not provided.",
    },
    MISSING_PARAMETERS: {
        error_code: 10004,
        error_message:
            "Parameters in request body or query are missing. Please try again later.",
    },
    INVALID_QUERY_PARAMS: {
        error_code: 10005,
        error_message: "Query params provided are invalid.",
    },
    INVALID_JSON_BODY: {
        error_code: 10004,
        error_message: "JSON data in body is invalid.",
    },
    CONNECTION_TIMEOUT: {
        error_code: 10005,
        error_message: "Cannot reach the service.",
    },
    CONNECTION_REFUSED: {
        error_code: 10006,
        error_message: "Service refused to connect.",
    },

    // Invalid Param Error
    COMPANY_NOT_FOUND: {
        error_code: 20000,
        error_message: "Company with the given name cannot be found.",
    },
    COMPANY_NAME_INVALID: {
        error_code: 20001,
        error_message:
            "Company name is invalid (Should not contain blank space).",
    },
    FILE_NOT_FOUND: {
        error_code: 20002,
        error_message: "File/Public Key with the given value cannot be found.",
    },
    FILE_EXISTED: {
        error_code: 20003,
        error_message:
            "File or Public Key with the given value already exists.",
    },
    MESSAGE_NOT_FOUND: {
        error_code: 20004,
        error_message: "ID/Receiver of message cannot be found.",
    },
    MESSAGE_CONTENT_INVALID: {
        error_code: 20005,
        error_message: "Sender Public Key or Receiver Public Key is invalid.",
    },
    CREDENTIAL_NOT_FOUND: {
        error_code: 20005,
        error_message: "Hash of credential cannot be found.",
    },

    // Content Errors
    USER_DID_DOC_INVALID: {
        error_code: 30000,
        error_message:
            "Content of user's did doc is invalid. Please make sure all required fields are provided with their valid value.",
    },
    WRAP_DOC_DID_DOC_INVALID: {
        error_code: 30001,
        error_message:
            "Content of wrapped document's did doc is invalid. Please make sure all required fields are provided with their valid value.",
    },
    WRAP_DOC_DID_DOC_INVALID_MODIFIED: {
        error_code: 30002,
        error_message: "DID of the did document should not be modified.",
    },
    CREDENTIAL_INVALID: {
        error_code: 30003,
        error_message:
            "Content of credential is invalid. Please make sure all required fields are provided with their valid value.",
    },
};

const SUCCESS_CODES = {
    SAVE_SUCCESS: { message: "Successfully Saved" },
    CLONE_SUCCESS: { message: "Successfully Cloned" },
    UPDATE_SUCCESS: { message: "Successfully Updated" },
    DELETE_SUCCESS: { message: "Successfully Deleted" },
};

export { SERVICES, ERROR_CODES, SUCCESS_CODES };
