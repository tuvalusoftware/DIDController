import Ajv from "ajv";
import { ERROR_CODES } from "../constants/index.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ajv = new Ajv();
const schema = require("./schema.json");

export default {
    validateDidDocOfUser(obj) {
        const validate = ajv.compile(schema.did_doc_of_user);
        const isValid = validate(obj);

        if (!isValid) {
            throw ERROR_CODES.USER_DID_DOC_INVALID;
        }

        return isValid;
    },
    validateDidDocOfWrapDoc(obj) {
        const validate = ajv.compile(schema.did_doc_of_wrap_doc);
        const isValid = validate(obj);

        if (!isValid) {
            throw ERROR_CODES.WRAP_DOC_DID_DOC_INVALID;
        }

        return isValid;
    },
};
