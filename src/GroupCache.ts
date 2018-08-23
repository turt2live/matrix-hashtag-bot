import * as mkdirp from "mkdirp";
import config from "./config";
import * as fs from "fs";
import * as path from "path";

class _GroupCache {

    private hashtagMap: { [hashtag: string]: string }; // hashtag => groupId

    constructor() {
        mkdirp.sync(config.dataPath);
        this.loadMap();
    }

    public getGroupId(hashtag: string): string {
        return this.hashtagMap[hashtag];
    }

    public setGroupId(hashtag: string, groupId: string) {
        this.hashtagMap[hashtag] = groupId;
        this.saveMap();
    }

    private saveMap() {
        fs.writeFileSync(path.join(config.dataPath, "groups.json"), JSON.stringify(this.hashtagMap), 'utf8');
    }

    private loadMap() {
        try {
            const val = fs.readFileSync(path.join(config.dataPath, "groups.json"), 'utf8');
            this.hashtagMap = JSON.parse(val.toString());
        } catch (e) {
            if (e.code === "ENOENT") {
                this.hashtagMap = {};
                return; // non-fatal
            }

            throw e;
        }
    }
}

export const GroupCache = new _GroupCache();
