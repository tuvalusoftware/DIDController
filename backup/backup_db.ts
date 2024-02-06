import { exec } from "child_process";
import dayjs from "dayjs";
import dotenv from "dotenv";
import env from "../src/constants/env";

dotenv.config();
const mongoURL = `mongodb://localhost:27010/${env.MONGO_DB_NAME}`;

if (!mongoURL) throw new Error("Cannot perform this operation");

const now = dayjs();
const formattedDate = now.format("ddddDDMMYYYY_HHmmss");

const CMD = `mongodump --username ${env.MONGO_INITDB_ROOT_USERNAME} --password ${env.MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin --uri="${mongoURL}" --out ~/dc-back-up/data_${formattedDate}`;

exec(CMD, function (error, stdout, stderr) {
    if (error) {
        console.error(error);
    } else {
        console.log(`Backup successfully. ${formattedDate}.\n`);
    }
});
