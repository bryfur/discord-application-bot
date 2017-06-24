// Import the discord.js module
import { TextChannel, Message, Client, User } from "discord.js";
import { MongoClient, Db } from "mongodb";
import { Poll, PollFactory } from "./Poll";

export async function echo(message: Message, tokens: string[]) {
    if (tokens.length >= 2) {
        const echoChannel = message.guild.channels.find("name", tokens[1]) as TextChannel;
        if (echoChannel) {
            let messageString = "";
            for (let i = 2; i < tokens.length; i++) {
                messageString += tokens[i] + " ";
            }
            await echoChannel.send(messageString);
        }else {
            await message.channel.send("Channel {" + tokens[1] + "} not found");
        }
    } else {
        await message.channel.send("Command not valid.");
    }
}

export async function schedule(message: Message, tokens: string[], db: Db) {
    const role = message.guild.roles.find("name", tokens[3]);
    const outputChannel = <TextChannel>message.guild.channels.find("name", tokens[4]);

    const poll = await PollFactory(tokens[1], tokens[2], ["yes", "no", "late"], role, outputChannel, db);
    await poll.start();
}

export async function info(message: Message, tokens: string[], db: Db) {
}

export async function cancel(message: Message, tokens: string[], db: Db) {
}

export async function help(message: Message, tokens: string[]) {
}