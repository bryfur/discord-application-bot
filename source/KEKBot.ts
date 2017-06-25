// Import the discord.js module
import { TextChannel, Message, Client } from "discord.js";
import { WordTokenizer } from "natural";
import { MongoClient, Db } from "mongodb";

import * as assert from "assert";

import { KEKError } from "./KEKError";
import * as AdminFunctions from "./AdminFunctions";

const tokenizer = new WordTokenizer();
const client = new Client();

const dburl = "mongodb://localhost:27017/KEKBot";
const token = "MzIzMTMwNDE3OTgyOTk2NDgx.DDBFGw.n2S_IOmNjnAIxr3wH_338mvHlIQ";
const guildId = "293221521600675840";
const adminChannelId = "293528648760295424";

let db: Db = undefined;

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", async message => {
    try {
        if (!message.author.bot) {
            if (message.channel.id === adminChannelId) {
                const tokens = tokenizer.tokenize(message.content);
                switch (tokens[0].toLowerCase()) {
                    case "echo":
                        await AdminFunctions.echo(message, tokens);
                        break;
                    case "schedule":
                        await AdminFunctions.poll(message, tokens, db);
                        break;
                    case "info":
                        await AdminFunctions.info(message, tokens, db);
                        break;
                    case "cancel":
                        await AdminFunctions.cancel(message, tokens, db);
                        break;
                    case "help":
                        await AdminFunctions.help(message, tokens);
                        break;
                    default:
                        throw new KEKError("Command not recognized.");
                }
            }
            else if (message.channel.type === "dm") {
            }
        }
    } catch (error) {
        console.log((<Error>error).message + (<Error>error).stack);
        if (error instanceof KEKError) {
            await message.channel.send((<KEKError>error).message);
        } else {
            await message.channel.send("A System Error has occured.");
        }
    }
});

MongoClient.connect(dburl, function (err, dbc) {
    assert.equal(undefined, err);
    console.log("Connected successfully to server");
    db = dbc;
});

// Log our bot in
client.login(token);