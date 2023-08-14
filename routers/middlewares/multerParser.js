import multer from "multer";

export default {
    single: (fieldName) =>
        multer({
            storage: multer.memoryStorage(),
        }).single(fieldName),
};
