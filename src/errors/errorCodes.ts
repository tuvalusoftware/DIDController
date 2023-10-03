import { FILE_NAME_CONVENTION_REGEX } from "../constants/common";

export type ERROR_CODE = {
  error_code: number;
  error_message: string;
  error_cause?: string;
};

export const ERROR_CODES = {
  // Github API Error
  GITHUB_API_ERROR: {
    error_code: 1200,
    error_message: "Unexpected Storage Error.",
    error_cause:
      "Potential Errors: invalid repository name, invalid github auth token, ... Or any other unexpected error given by Github API.",
  },
  INVALID_GITHUB_CREDENTIAL: {
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
    error_cause: "Create a tag/release. A tag with the same name already exist",
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

  // Mongo DB Errors
  MONGO_DATA_NOT_FOUND: {
    error_code: 4000,
    error_message: "No results found for specified input query in database.",
  },
  MONGO_CAST_ERROR: {
    error_code: 4010,
    error_message: "The data of Mongo ID is invalid.",
  },
  MONGO_DUPLICATE_KEY: {
    error_code: 4011,
    error_message: "Duplicate key error.",
  },
  MONGO_LARGE_DOCUMENT: {
    error_code: 4012,
    error_message: "Document too large error.",
  },
  MONGO_VALIDATION: {
    error_code: 4013,
    error_message:
      "Data contains properties that do not meet the specified validation criteria. Please check the provided values.",
  },
  MONGO_INVALID_GEOJSON: {
    error_code: 4014,
    error_message: "Sever error. Invalid GeoJSON detected in Mongo DB.",
  },
  MONGO_FIELD_NOT_EXIST: {
    error_code: 4015,
    error_message: "Sever error. Select not exist field.",
  },

  // Common Errors
  UNKNOWN_ERROR: {
    error_code: 10000,
    error_message: "Something went wrong with the server!",
  },
  SECURITY_SERVICE_URL_INVALID: {
    error_code: 10001,
    error_message: "Unauthorized.",
    error_cause: "Cannot found security service.",
  },
  SECURITY_SERVICE_AUTHENTICATION: {
    error_code: 10002,
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
    error_code: 10006,
    error_message: "JSON data in body is invalid.",
  },
  CONNECTION_TIMEOUT: {
    error_code: 10007,
    error_message: "Cannot reach the service.",
  },
  CONNECTION_REFUSED: {
    error_code: 10008,
    error_message: "Service refused to connect.",
  },
  FILE_NAME_INVALID: {
    error_code: 10009,
    error_message: "File name does not match the correct format.",
    error_cause: `File name regex: ${FILE_NAME_CONVENTION_REGEX}`,
  },
  INVALID_INPUT: {
    error_code: 10010,
    error_message: "Invalid Input or Missing Fields.",
  },

  // Invalid Param Error
  COMPANY_NOT_FOUND: {
    error_code: 20000,
    error_message: "Company with the given name cannot be found.",
  },
  COMPANY_NAME_INVALID: {
    error_code: 20001,
    error_message: "Company name is invalid (Should not contain blank space).",
  },
  FILE_NOT_FOUND: {
    error_code: 20002,
    error_message: "File/Public Key with the given value cannot be found.",
  },
  FILE_EXISTED: {
    error_code: 20003,
    error_message: "File or Public Key with the given value already exists.",
  },
  MESSAGE_NOT_FOUND: {
    error_code: 20004,
    error_message: "ID/Receiver of message cannot be found.",
  },
  MESSAGE_CONTENT_INVALID: {
    error_code: 20005,
    error_message: "Sender Public Key or Receiver Public Key is invalid.",
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
  DOC_NOT_FOUND: {
    error_code: 30004,
    error_message: "Document with the given info cannot be found.",
  },
  DID_DOC_NOT_FOUND: {
    error_code: 30005,
    error_message: "DID Document with the given info cannot be found.",
  },

  // Credential
  CREDENTIAL_INVALID: {
    error_code: 30003,
    error_message:
      "Content of credential is invalid. Please make sure all required fields are provided with their valid value.",
  },
  CREDENTIAL_NOT_FOUND: {
    error_code: 20006,
    error_message: "Credential with the given info cannot be found.",
  },
  CREDENTIAL_EXISTED: {
    error_code: 21006,
    error_message: "Hash of credential already exist.",
  },
};
