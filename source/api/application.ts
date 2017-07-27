import { Db } from "mongodb";
import { Client, TextChannel, Message } from "discord.js";
import { Router } from "express";
import * as express from "express";
import * as cookieSession from "cookie-session";

import * as config from "../config";
import * as discordauth from "./discordauth";
import { catchAsync } from "../utils";

export function application(db: Db, client: Client): Router {
    const app = express();
    const router = express.Router();
    const apps = db.collection("applications");
    const channel = <TextChannel>client.channels.find("id", config.applicationChannelId);

    router.use(cookieSession({
        name: "session",
        keys: [config.token],
        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }));

    router.get("/get", catchAsync(async (req, res) => {
        if (!await discordauth.IsUserAuthorized(req.session.discordtoken, req.query.id)) {
            res.send(401);
            return;
        }
        const application = await apps.findOne({ "id": req.query.id });
        // Report if user is already a member
        const alreadymember = client.guilds.find("id", config.guildId).members.exists("id", req.query.id);
        if (!application) {
            const doc = { "alreadymember": alreadymember };
            res.json(doc);
        } else {
            application.alreadymember = alreadymember;
            res.json(application);
        }
    }));

    router.put("/submit", catchAsync(async (req, res) => {
        if (!await discordauth.IsUserAuthorized(req.session.discordtoken, req.body.id)) {
            res.send(401);
            return;
        }
        delete req.body["_id"];
        const application = await apps.findOne({ "id": req.body.id });

        let messageEdited = false;
        // if an application and discordMessage already exist edit it
        if (application && application.messageid) {
            const discordMessage = await channel.fetchMessage(application.messageid);
            if (discordMessage) {
                discordMessage.edit(BuildMessage(req.body));
                messageEdited = true;
            }
        }
        //  if message couldn't be editted send a new message
        if (!messageEdited) {
            const message = await channel.send(BuildMessage(req.body));
            req.body.messageid = (<Message>message).id;
        }

        req.body.submitted = true;
        req.body.saved = false;
        req.body.accepted = false;
        await apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
        res.json(req.body);
    }));

    router.put("/save", catchAsync(async (req, res) => {
        if (!await discordauth.IsUserAuthorized(req.session.discordtoken, req.body.id)) {
            res.send(401);
            return;
        }
        delete req.body["_id"];
        req.body.saved = true;
        apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
        res.json(req.body);
    }));

    // TODO: Seperate Message Building and Application managment
    function BuildMessage(app): object {
        return {
            "embed": {
                "color": 15323198,
                "timestamp": new Date(),
                "author": {
                    "name": app.discordaccount
                },
                "fields": [
                    {
                        "name": "**What is your name and your GW2 ingame name (Example.1234)?**",
                        "value": app.gw2name
                    },
                    {
                        "name": "**We raid Sun/Mon/Weds 9:30 EST, are you available all these times?**",
                        "value": app.attendance
                    },
                    {
                        "name": "**Will you actively use your mic to contribute to the guild during raids and other times?**",
                        "value": app.mic
                    },
                    {
                        "name": "**What is/are your main classes?**",
                        "value": app.class
                    },
                    {
                        "name": "**What is your prior experience in wvw guilds?**",
                        "value": app.experience
                    },
                    {
                        "name": "**Show us the build you are currently running in WvW?**",
                        "value": app.build
                    },
                    {
                        "name": "**Do you have footage/can you record?**",
                        "value": app.record
                    },
                    {
                        "name": "**What's your capacity right now?**",
                        "value": app.capacity
                    }
                ]
            }
        };
    }

    return router;
}