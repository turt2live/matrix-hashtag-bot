import { MatrixClient } from "matrix-bot-sdk";
import config from "./config";
import { GroupCache } from "./GroupCache";
import * as templateString from "string-template";
import { LogService } from "matrix-js-snippets";
import striptags = require("striptags");

export class CommandProcessor {
    constructor(private client: MatrixClient) {
    }

    public async tryCommand(roomId: string, event: any): Promise<any> {
        try {
            const message = event['content']['body'];
            if (!message) return;

            const matches = message.match(/#[a-zA-Z0-9:]*/gm);
            if (!matches && !message.startsWith("!hashtag")) return;

            if (matches) {
                const groupsCreated: string[] = [];
                for (const hashtag of matches) {
                    if (hashtag.length <= 1 || hashtag.indexOf(":") !== -1) continue;
                    const groupId = await this.createOrGetGroupHashtag(hashtag.substring(1));
                    groupsCreated.push(groupId);
                }

                if (groupsCreated.length === 0) return;

                const groupPills = groupsCreated.map(g => `<a href="https://matrix.to/#/${g}">${g}</a>`);
                return this.sendHtmlReply(roomId, event, groupPills.join(" "), "info");
            }

            let command = "help";
            const args = message.substring("!hashtag".length).trim().split(" ");
            if (args.length > 0) {
                command = args[0];
                args.splice(0, 1);
            }

            if (command === "invite") {
                if (args.length < 1) {
                    return this.sendHtmlReply(roomId, event, "Please provide a hashtag I can invite you to.", "warning");
                }

                const groupId = await this.createOrGetGroupHashtag(args[0]);
                await this.client.unstableApis.inviteUserToGroup(groupId, event['sender']);
                return this.sendHtmlReply(roomId, event, "Invite sent!", "success");
            } else {
                const htmlMessage = "<p>Hashtag bot help:<br /><pre><code>" +
                    "#your_hashtag                   - Creates a group for 'your_hashtag'\n" +
                    "!hashtag invite your_hashtag    - Invites you to the group for the hashtag\n" +
                    "!hashtag help                   - This menu\n" +
                    "</code></pre></p>";
                return this.sendHtmlReply(roomId, event, htmlMessage, "info");
            }
        } catch (e) {
            LogService.error("CommandProcessor", e);
            return this.sendHtmlReply(roomId, event, "There was an error processing your command.", "error");
        }
    }

    private async createOrGetGroupHashtag(hashtag: string): Promise<string> {
        if (GroupCache.getGroupId(hashtag)) {
            return GroupCache.getGroupId(hashtag);
        }

        LogService.info("CommandProccessor", "Creating group for hashtag: " + hashtag);
        const groupId = await this.client.unstableApis.createGroup(templateString(config.groupLocalpartFormat, {tag: hashtag}));
        await this.client.unstableApis.setGroupJoinPolicy(groupId, "open");
        await this.client.unstableApis.setGroupProfile(groupId, {
            avatar_url: "mxc://t2l.io/cdb953a362d6dc8ff32a959b3d4afc99",
            long_description: `This group is a hashtag group for #${hashtag}`,
            short_description: `Welcome to #${hashtag}`,
            name: `#${hashtag}`,
        });

        GroupCache.setGroupId(hashtag, groupId);
        return groupId;
    }

    private sendHtmlReply(roomId: string, event: any, message: string, status: "info" | "warning" | "error" | "critical" | "success"): Promise<any> {
        const plain = "> <" + event['sender'] + "> " + event['content']['body'] + "\n\n" + striptags(message);
        const html = "" +
            "<mx-reply><blockquote>" +
            "<a href='https://matrix.to/#/" + roomId + "/" + event['event_id'] + "'>In reply to</a> <a href='https://matrix.to/#/" + event['sender'] + "'>" + event['sender'] + "</a><br/>" +
            event['content']['body'] + "</blockquote></mx-reply>" + message;
        return this.client.sendMessage(roomId, {
            msgtype: "m.notice",
            body: plain,
            format: "org.matrix.custom.html",
            formatted_body: html,
            status: status,
            "m.relates_to": {
                "m.in_reply_to": {
                    event_id: event['event_id'],
                },
            },
        });
    }
}