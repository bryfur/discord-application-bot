"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import the discord.js module
const discord_js_1 = require("discord.js");
const natural_1 = require("natural");
const mongodb_1 = require("mongodb");
const assert = require("assert");
const AdminFunctions = require("./AdminFunctions");
const tokenizer = new natural_1.WordTokenizer();
const client = new discord_js_1.Client();
const dburl = "mongodb://localhost:27017/KEKBot";
const token = "MzIzMTMwNDE3OTgyOTk2NDgx.DB2qZg.DINw8hX44SPaUwLREYMiKUSAMsY";
const guildId = "293221521600675840";
const adminChannelId = "293528648760295424";
let db = undefined;
client.on("ready", () => {
    console.log("I am ready!");
});
client.on("message", message => {
    console.log(message.content);
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
mongodb_1.MongoClient.connect(dburl, function (err, dbc) {
    assert.equal(undefined, err);
    console.log("Connected successfully to server");
    db = dbc;
    db.close();
});
// Log our bot in
client.login(token);
//# sourceMappingURL=RaidBot.js.map