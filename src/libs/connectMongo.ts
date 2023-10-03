import mongoose from "mongoose";

import env from "../constants/env";
import Logger from "./Logger";

export default () => {
  const username = env.MONGO_INITDB_ROOT_USERNAME;
  const password = env.MONGO_INITDB_ROOT_PASSWORD;
  const port = env.MONGODB_PORT;
  const dbName =
    env.NODE_ENV !== "test" ? env.MONGO_DB_NAME : "controller_test";

  const dbURL = `mongodb://localhost:${port}/${dbName}`;

  const connect = () => {
    mongoose
      .connect(dbURL)
      .then(() => {
        return Logger.info(`Successfully connected to ${dbURL}`);
      })
      .catch((error) => {
        Logger.error("Error connecting to Mongo DB ...");
        Logger.error(error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on("disconnected", connect);
};
