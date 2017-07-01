import { Db } from "mongodb";
import { Client, TextChannel, Message } from "discord.js";
import { Router } from "express";
import * as express from "express";

import { catchAsync } from "../utils";

export function application (db: Db, client: Client): Router {
    const app = express();
    const router = express.Router();
    const apps = db.collection("applications");
    const channel = <TextChannel>client.channels.find("id", "330582495164628992");

    router.get("/get", catchAsync(async (req, res) => {
        const doc = await apps.findOne({ "id": req.query.id });
        if (doc)
            res.json(doc);
    }));

    // create todo and send back all todos after creation
    router.post("/submit", catchAsync(async (req, res) => {
        delete req.body["_id"];
        const doc = await apps.findOne({ "id": req.body.id });
        if (doc) {
            const message = channel.messages.find("id", doc.messageid);
            if (message) {
                message.edit(messageBuilder(req));
                req.body.messageid = doc.messageid;
                await apps.updateOne({ "id": req.body.id },
                    req.body,
                    { upsert: true }
                );
                return;
            }
        }
        const message = await channel.send(messageBuilder(req));
        req.body.messageid = (<Message>message).id;
        apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
    }));

    // create todo and send back all todos after creation
    router.post("/save", catchAsync(async (req, res) => {
        delete req.body["_id"];
        apps.updateOne({ "id": req.body.id },
            req.body,
            { upsert: true }
        );
    }));

    function messageBuilder(req): string {
        return "**What is your GW2 ingame name (Example.1234)?**\n" +
            req.body.gw2name +
            "\n**We raid Sun/Mon/Weds 9:30 EST, are you available all these times?**\n" +
            req.body.attendance +
            "\n**Will you actively use your mic to contribute to the guild during raids and other times?**\n" +
            req.body.mic +
            "\n**What is/are your main classes?**\n" +
            req.body.class +
            "\n**What is your prior experience in wvw guilds?**\n" +
            req.body.experience +
            "\n**Show us the build you are currently running in WvW?**\n" +
            req.body.build +
            "\n**Do you have footage/can you record?**\n" +
            req.body.record +
            "\n**What's your capacity right now?**\n" +
            req.body.capacity;
    }
    return router;
}