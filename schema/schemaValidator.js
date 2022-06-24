/* c8 ignore start */
import Ajv from "ajv";
import { ERROR_CODES } from "../constants/index.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ajv = new Ajv();
const schema = require("./did_doc.json");

export default {
    validateDidDoc(obj) {
        const validate = ajv.compile(schema.did_doc);
        const isValid = validate(obj);

        if (!isValid) throw ERROR_CODES.DID_DOC_CONTENT_INVALID;

        return true;
    },
};
/* c8 ignore stop */
