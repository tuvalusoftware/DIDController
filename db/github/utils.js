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

export { tryParse, getFileExtension, stringToDate, isExistsKey };
