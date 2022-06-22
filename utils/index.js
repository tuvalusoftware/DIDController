import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

/**
 * @description Try to parse a string-typed data, if the string cannot be parsed, return itself
 * @param {String} dataString
 * @returns {String}
 */
const tryParse = (dataString) => {
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
 * @param {Array} smallArr array with less elememt
 * @returns {Boolean}
 */
const containAllElement = (bigArr, smallArr) => {
    return smallArr.every((element) => {
        return bigArr.includes(element);
    });
};

/**
 * @description Convert a 'DD/MM/YYYY' string to a datetime object (the time will be at 0:00 AM)
 * @param {String} dateStr string with format "DD/MM/YYYY"
 * @returns {Date}
 */
const stringToDate = (dateStr) => {
    return dayjs(dateStr, "DD/MM/YYYY", true).toDate();
};

/**
 * @description Check if key exists in object
 * @param {String} key value of a key
 * @param {Object} obj An object
 * @returns {Boolean} True if exists
 */
const isExistsKey = (key, obj) => {
    return obj[key] !== undefined;
};

/**
 * @description Validate if a set of keys exist in an object
 * @param {Array} keys array of keys
 * @param {Object} obj
 * @returns {Boolean}
 */
const validateObject = (keys, obj) => {
    const isValid = keys.every((el) => isExistsKey(el, obj));
    return isValid;
};

/**
 * @description Extract the owner public key from an user's did
 * @param {String} didString DID of the owner
 * @returns {String} owner public key
 */
const extractOwnerPKFromDID = (didString) => {
    const fields = didString.split(":");
    return fields[fields.length - 1];
};

export {
    containAllElement,
    haveCommonElement,
    tryParse,
    getFileExtension,
    stringToDate,
    isExistsKey,
    validateObject,
    extractOwnerPKFromDID,
};
