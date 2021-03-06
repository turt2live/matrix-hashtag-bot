import * as config from "config";
import { LogConfig } from "matrix-js-snippets";

interface IConfig {
    homeserverUrl: string;
    accessToken: string;

    groupLocalpartFormat: string;
    dataPath: string;

    logging: LogConfig;
}

const conf = <IConfig>config;

if (process.env["BOT_DATA_PATH"]) {
    const realPath = process.env["BOT_DATA_PATH"];
    if (realPath !== conf.dataPath) {
        console.warn("Configuration and environment variables do not agree on the data path. Using " + realPath);
    }

    conf.dataPath = realPath;
}

if (process.env["BOT_DOCKER_LOGS"]) {
    console.log("Altering log configuration to only write out to console");
    conf.logging = {
        file: "/data/logs/hashtag.log",
        console: true,
        consoleLevel: conf.logging.consoleLevel,
        fileLevel: "error",
        writeFiles: false,
        rotate: {
            size: 0,
            count: 0,
        },
    };
}

export default conf;