import { exec } from "child_process";
import { Cron } from "croner";
import dayjs from "dayjs";

const backupData = () => {
    const CMD = `npm run backup`;
    const timestamp = dayjs().format("HH:mm:ss Z");
    const date = dayjs().format("dddd, DD/MM/YYYY");

    exec(CMD, async function (error, stdout, stderr) {
        if (!error) {
            console.log(`Data backed up at ${timestamp}, ${date}.`);

            try {
                console.log("Email sent.\n");
            } catch (err) {
                console.log(error);
            }
        } else {
            console.log(error);
        }
    });
};

backupData();

// Schedule backup every 24 hours
const cron = new Cron("0 0 0 * * *", { name: "BackupData" }, async (job: any) => {
    console.log("Backing up data ...");
    backupData();
});
