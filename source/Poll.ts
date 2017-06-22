import { Collection, MongoClient, Db } from "mongodb";
import { GuildMember, Message } from "discord.js";

export class Poll {
    users: Collection;
    polls: Collection;
    reportMessage: Message;

    constructor(name: string, question: string, users: GuildMember[], validresponses: string[], db: Db) {
        this.polls = db.collection("polls");
        this.users = db.collection("users");

        this.polls.insertOne(
            { "_id": name,
              "question": question,
              "responses": validresponses
            });

        for (let i = 0; i < users.length; i++) {
            this.users.insertOne({
                "_id": users[i].id,
                "name": users[i].displayName,
                "pollAnswer": "No Answer"
            });
        }

    }

    start() {

    }

    UpdateMessage() {

    }
}