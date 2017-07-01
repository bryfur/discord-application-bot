import { Db } from "mongodb";
import { Client, TextChannel, Message } from "discord.js";
import { Router } from "express";
import * as express from "express";

import * as config from "../config";
import { catchAsync } from "../utils";

export function application(db: Db, client: Client): Router {
    const app = express();
    const router = express.Router();
    const apps = db.collection("applications");
    const channel = <TextChannel>client.channels.find("id", config.applicationChannelId);

    router.get("/get", catchAsync(async (req, res) => {
        const doc = await apps.findOne({ "id": req.query.id });
        const alreadymember = client.guilds.find("id", config.guildId).members.exists("id", req.query.id);
        if (!doc) {
            const doc = { "alreadymember": alreadymember };
            res.json(doc);
        } else {
            doc.alreadymember = alreadymember;
            res.json(doc);
        }
    }));

    // create todo and send back all todos after creation
    router.put("/submit", catchAsync(async (req, res) => {
        delete req.body["_id"];
        const doc = await apps.findOne({ "id": req.body.id });
        if (doc && doc.messageid) {
            const message = await channel.fetchMessage(doc.messageid);
            if (message) {
                message.edit(messageBuilder(req));
                req.body.messageid = doc.messageid;
                req.body.submitted = true;
                req.body.saved = false;
                req.body.accepted = false;
                await apps.updateOne({ "id": req.body.id },
                    req.body,
                    { upsert: true }
                );
                res.json(req.body);
                return;
            }
        }
        const message = await channel.send(messageBuilder(req));
        req.body.messageid = (<Message>message).id;
        req.body.submitted = true;
        req.body.saved = false;
        req.body.accepted = false;
        await apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
        res.json(req.body);
    }));

    // create todo and send back all todos after creation
    router.put("/save", catchAsync(async (req, res) => {
        delete req.body["_id"];
        req.body.saved = true;
        apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
        res.json(req.body);
    }));

    function messageBuilder(req): object {
        return {
            "embed": {
                "color": 15323198,
                "timestamp": new Date(),
                "author": {
                    "name": req.body.discordaccount
                },
                "fields": [
                    {
                        "name": "**What is your name and your GW2 ingame name (Example.1234)?**",
                        "value": req.body.gw2name
                    },
                    {
                        "name": "**We raid Sun/Mon/Weds 9:30 EST, are you available all these times?**",
                        "value": req.body.attendance
                    },
                    {
                        "name": "**Will you actively use your mic to contribute to the guild during raids and other times?**",
                        "value": req.body.mic
                    },
                    {
                        "name": "**What is/are your main classes?**",
                        "value": req.body.class
                    },
                    {
                        "name": "**What is your prior experience in wvw guilds?**",
                        "value": req.body.experience
                    },
                    {
                        "name": "**Show us the build you are currently running in WvW?**",
                        "value": req.body.build
                    },
                    {
                        "name": "**Do you have footage/can you record?**",
                        "value": req.body.record
                    },
                    {
                        "name": "**What's your capacity right now?**",
                        "value": req.body.capacity
                    }
                ]
            }
        };
    }

    return router;
}