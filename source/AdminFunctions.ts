// Import the discord.js module
import { TextChannel, Message, Client, User } from "discord.js";
import { MongoClient, Db } from "mongodb";
import { Poll, PollFactory } from "./Poll";
import { KEKError } from "./KEKError";

export async function echo(message: Message, tokens: string[]) {
    if (tokens.length < 2)
        throw new KEKError("Command does not have enough arguments");

    const echoChannel = message.guild.channels.find("name", tokens[1]) as TextChannel;
    if (!echoChannel)
        throw new KEKError("Channel {" + tokens[1] + "} not found");

    let messageString = "";
    for (let i = 2; i < tokens.length; i++) {
        messageString += tokens[i] + " ";
    }
    await echoChannel.send(messageString);
}

export async function poll(message: Message, tokens: string[], db: Db) {
    if (tokens.length < 6)
        throw new KEKError("Command does not have enough arguments");

    const role = message.guild.roles.find("name", tokens[3]);
    if (!role)
        throw new KEKError("Role {" + tokens[3] + "} not found");

    const outputChannel = <TextChannel>message.guild.channels.find("name", tokens[4]);
    if (!outputChannel)
        throw new KEKError("Channel {" + tokens[4] + "} not found");
    
    let answers: string[] = tokens.slice(5);

    const poll = await PollFactory(tokens[1], tokens[2], answers, role, outputChannel, db);
    await poll.start();
}

export async function schedule(message: Message, tokens: string[], db: Db) {
}

export async function info(message: Message, tokens: string[], db: Db) {
}

export async function cancel(message: Message, tokens: string[], db: Db) {
}

export async function help(message: Message, tokens: string[]) {
    await message.channel.send("***echo*** *ChannelName* Message...\n" +
                                "***poll*** *PollName Question Role OutputChannel* Answers...\n" +
                                "***delete*** *PollName*\n" +
                                "***schedule*** *PollName StartTime* Days...\n" +
                                "***cancel*** *PollName*\n" +
                                "***info***\n");
}