import Ajv from "ajv";
import Logger from "../logger.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ajv = new Ajv();
const DEFINE_SCHEMAS = require("./schema.json");

export default {
    _validateWrapDidDoc(didDoc, fileName) {
        return didDoc.url === `${fileName}.document`;
    },
    validate(obj, type, payload = null) {
        const schema = DEFINE_SCHEMAS[type];

        // Validate schema using AJV
        const validate = ajv.compile(schema);
        const isValid = validate(obj);

        // Logging out Schema errors, ignore if it is a ERROR_OBJECT
        if (!isValid && type !== "ERROR_OBJECT")
            Logger.error(
                `[SCHEMA ERROR - ${type}]: ${JSON.stringify(validate.errors)}`
            );

        // Extra validation depends on the content
        let extraValidation = true;
        if (type === "WRAP_DOC_DID_DOC" && payload)
            extraValidation = this._validateWrapDidDoc(obj, payload.fileName);

        return isValid && extraValidation;
    },
};
