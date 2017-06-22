// Import the discord.js module
import { TextChannel, Message, Client } from "discord.js";
import { WordTokenizer } from "natural";
import { MongoClient, Db } from "mongodb";

import * as assert from "assert";
import * as AdminFunctions from "./AdminFunctions";

const tokenizer = new WordTokenizer();
const client = new Client();

const dburl = "mongodb://localhost:27017/KEKBot";
const token = "MzIzMTMwNDE3OTgyOTk2NDgx.DB2qZg.DINw8hX44SPaUwLREYMiKUSAMsY";
const guildId = "293221521600675840";
const adminChannelId = "293528648760295424";

let db: Db  = undefined;

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", message => {
    if (!message.author.bot) {
        if (message.channel.id === adminChannelId) {
            const tokens = tokenizer.tokenize(message.content);
            switch (tokens[0].toLowerCase()) {
                case "echo":
                    AdminFunctions.echo(message, tokens);
                    break;
                case "schedule":
                    AdminFunctions.schedule(message, tokens, db);
                    break;
                case "info":
                    AdminFunctions.info(message, tokens, db);
                    break;
                case "cancel":
                    AdminFunctions.cancel(message, tokens, db);
                    break;
                default:
                    message.channel.send("Command not recognized.");
                    break;
            }
        }
    }
});

MongoClient.connect(dburl, function(err, dbc) {
  assert.equal(undefined, err);
  console.log("Connected successfully to server");
  db = dbc;
  db.close();
});

// Log our bot in
client.login(token);