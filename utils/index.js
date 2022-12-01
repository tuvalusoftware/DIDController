import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import fs from "fs";
dayjs.extend(customParseFormat);

/**
 * @description Try to parse a string-typed data, if the string cannot be parsed, return itself
 * @param {String} dataString
 * @returns {String}
 */
const tryParseStringToObj = (dataString) => {
    try {
        return JSON.parse(dataString);
    } catch (e) {
        return dataString;
    }
};

/**
 * @description Return the extension from a file path
 * @param {String} filePath Path to the file
 * @returns {String}
 */
const getFileExtension = (filePath) =>
    filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length) || null;

/**
 * @description Check if there is any same element between 2 arrays
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Boolean}
 */
const haveCommonElement = (arr1, arr2) => {
    return arr1.some((element) => {
        return arr2.includes(element);
    });
};

/**
 * @description Check if every element from a small array contains in a big array
 * @param {Array} bigArr array with more element
 * @param {Array} smallArr array with less element
 * @returns {Boolean}
 */
const containAllElement = (bigArr, smallArr) => {
    return smallArr.every((element) => {
        return bigArr.includes(element);
    });
};

/**
 * @description Extract the owner public key from an user's DID
 * @param {String} didString DID of the owner
 * @returns {String} owner public key
 */
const extractOwnerPKFromAddress = (didString) => {
    const fields = didString.split(":");
    return fields[fields.length - 1];
};

/**
 * @description Validate and extract the public key or filename from a DID
 * @param {String} did DID
 * @param {Boolean} isSalted Flag indicates if the DID is salted
 * @returns {{ valid: Boolean, companyName: String, fileNameOrPublicKey: String }} Object holds validation info, company name and file name/pk
 */
const validateDIDSyntax = (did, isSalted = false) => {
    const maxLength = isSalted ? 6 : 4,
        didPosition = isSalted ? 2 : 0,
        didComponents = did.split(":");

    if (
        didComponents.length < maxLength ||
        didComponents[didPosition] !== "did"
    )
        return { valid: false };

    return {
        valid: true,
        companyName: didComponents[didPosition + 2],
        fileNameOrPublicKey: didComponents[didPosition + 3],
    };
};

/**
 * @description Remove file extension from a full file name
 * @param {String} fileName
 * @returns {String}
 */
const removeFileExtension = (fileName) => {
    let parts = fileName.split(".");
    return parts[0];
};

/**
 *
 * @param {*} data
 * @param {String} fileName Name of json file to dumped data to
 */
const dumpDataToJSON = (data, fileName) => {
    fs.writeFileSync(`${fileName}.json`, JSON.stringify(data));
};

export {
    containAllElement,
    haveCommonElement,
    tryParseStringToObj,
    getFileExtension,
    extractOwnerPKFromAddress,
    validateDIDSyntax,
    removeFileExtension,
    dumpDataToJSON,
};
