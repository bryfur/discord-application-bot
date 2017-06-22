// Import the discord.js module
import { TextChannel, Message, Client, User } from "discord.js";
import { MongoClient, Db } from "mongodb";
import { Poll } from "./Poll";

export function echo(message: Message, tokens: string[]) {
    if (tokens.length >= 2) {
        const echoChannel = message.guild.channels.find("name", tokens[1]) as TextChannel;
        if (echoChannel) {
            let messageString = "";
            for (let i = 2; i < tokens.length; i++) {
                messageString += tokens[i] + " ";
            }
            echoChannel.send(messageString);
        }else {
            message.channel.send("Channel {" + tokens[1] + "} not found");
        }
    } else {
        message.channel.send("Command not valid.");
    }
}

export function schedule(message: Message, tokens: string[], db: Db) {
    const members = message.guild.roles.find("name", "test").members.array();
    const polls = db.collection("polls");
}

export function info(message: Message, tokens: string[], db: Db) {
}

export function cancel(message: Message, tokens: string[], db: Db) {
}

export function help(message: Message, tokens: string[]) {
}