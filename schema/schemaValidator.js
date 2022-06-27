import Ajv from "ajv";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ajv = new Ajv();
const schema = require("./schema.json");

export default {
    _validateWrapDidDoc(didDoc, fileName) {
        return didDoc.url === `${fileName}.document`;
    },
    validate(obj, type, payload = null) {
        const defineSchema = {
            USER_DID_DOC: schema.did_doc_of_user,
            WRAP_DOC_DID_DOC: schema.did_doc_of_wrap_doc,
        }[type];

        // Validate schema using AJV
        const validate = ajv.compile(defineSchema);
        const isValid = validate(obj);

        // Extra validation depends on the content
        let extraValidation = true;
        if (type === "WRAP_DOC_DID_DOC")
            extraValidation = this._validateWrapDidDoc(obj, payload.fileName);

        return isValid && extraValidation;
    },
};
