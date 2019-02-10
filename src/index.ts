import { AutojoinRoomsMixin, AutojoinUpgradedRoomsMixin, MatrixClient, SimpleRetryJoinStrategy } from "matrix-bot-sdk";
import config from "./config";
import { LogService } from "matrix-js-snippets";
import { CommandProcessor } from "./CommandProcessor";
import { LocalstorageStorageProvider } from "./LocalstorageStorageProvider";
import * as path from "path";

LogService.configure(config.logging);
const storageProvider = new LocalstorageStorageProvider(path.join(config.dataPath, "localstorage"));
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storageProvider);
const commands = new CommandProcessor(client);

let userId = "";
client.getUserId().then(uid => {
    userId = uid;

    client.on("room.message", (roomId, event) => {
        if (event['sender'] === userId) return;
        if (event['type'] !== "m.room.message") return;
        if (!event['content']) return;
        if (event['content']['msgtype'] !== "m.text") return;

        return commands.tryCommand(roomId, event);
    });

    AutojoinRoomsMixin.setupOnClient(client);
    AutojoinUpgradedRoomsMixin.setupOnClient(client);
    client.setJoinStrategy(new SimpleRetryJoinStrategy());
    return client.start();
}).then(() => LogService.info("index", "Hashtag bot started!"));
