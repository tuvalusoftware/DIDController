import dotenv from "dotenv";
import { cleanEnv, port, str, url } from "envalid";
import path from "path";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Interface
export interface ENV {
    NODE_ENV: string;
    SERVER_PORT: number;
    //Github config
    REPO_OWNER: string;
    DOCUMENT_REPO: string;
    CREDENTIAL_REPO: string;
    GITHUB_AUTH_TOKEN: string;
    AUTH_SERVICE: string;
    // MongoDB Config
    MONGODB_PORT: number;
    MONGO_INITDB_ROOT_USERNAME: string;
    MONGO_INITDB_ROOT_PASSWORD: string;
    MONGO_DB_NAME: string;
}

const env: ENV = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ["dev", "test", "production", "staging"] }),
    SERVER_PORT: port({ default: 58000 }),
    // Github DB config
    REPO_OWNER: str(),
    DOCUMENT_REPO: str(),
    CREDENTIAL_REPO: str(),
    GITHUB_AUTH_TOKEN: str(),
    AUTH_SERVICE: url(),
    // MongoDB Config
    MONGODB_PORT: port(),
    MONGO_INITDB_ROOT_USERNAME: str(),
    MONGO_INITDB_ROOT_PASSWORD: str(),
    MONGO_DB_NAME: str(),
});

export default env;
