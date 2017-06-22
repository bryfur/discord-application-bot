"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function echo(message, tokens) {
    if (tokens.length >= 2) {
        const echoChannel = message.guild.channels.find("name", tokens[1]);
        if (echoChannel) {
            let messageString = "";
            for (let i = 2; i < tokens.length; i++) {
                messageString += tokens[i] + " ";
            }
            echoChannel.send(messageString);
        }
        else {
            message.channel.send("Channel {" + tokens[1] + "} not found");
        }
    }
    else {
        message.channel.send("Command not valid.");
    }
}
exports.echo = echo;
function schedule(message, tokens, db) {
    const members = message.guild.roles.find("name", "test").members;
    const polls = db.collection("polls");
    db.on;
}
exports.schedule = schedule;
function info(message, tokens, db) {
}
exports.info = info;
function cancel(message, tokens, db) {
}
exports.cancel = cancel;
function help(message, tokens) {
}
exports.help = help;
//# sourceMappingURL=AdminFunctions.js.map