import morgan, { StreamOptions } from "morgan";

import env from "../../constants/env";
import Logger from "../../libs/Logger";

const stream: StreamOptions = {
    write: (message) =>
        Logger.http(message.substring(0, message.lastIndexOf("\n"))),
};

const skip = () => {
    return env.NODE_ENV === "production";
};

const morganMiddleware = morgan(":method :url (:status) - :response-time ms", {
    stream,
    skip,
});

export default morganMiddleware;
