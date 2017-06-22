import { Collection, MongoClient, Db } from "mongodb";
import { TextChannel, Message, Role, GuildMember } from "discord.js";

export class Poll {
    name: string;
    question: string;
    role: Role;
    includelate: boolean;
    outputChannel: TextChannel;

    polls: Collection;
    responses: Collection;

    header: string;
    reportMessage: Message | Message[];

    constructor(name: string, question: string, includelate: boolean, role: Role, outputChannel: TextChannel, db: Db) {
        this.name = name;
        this.question = question;
        this.includelate = includelate;
        this.role = role;
        this.outputChannel = outputChannel;
        this.polls = db.collection("polls");
        this.responses = db.collection("responses");

        this.header = "__***" + this.name + new Date().toLocaleDateString +
                                 "***__\n **" + this.question + "**\n";

        this.polls.insertOne(
            { "_id": name,
              "question": question,
              "includelate": includelate,
              "role": role.id
            });

        // this is probably really shit way to do this
        this.role.members.forEach(member => {
            this.responses.insertOne({
                "userid": member.id,
                "pollid": name,
                "displayname": member.displayName,
                "answer": "noanswer",
                "message": ""
            });
        });
    }

    start() {
        this.outputChannel.send(this.GetMessage()).then((message => {
            this.reportMessage = message;
        }));
    }

    Respond(user: GuildMember, message: Message) {
    }

    GetMessage(): string {

        let message = this.header;

        let yesCount = 0;
        let noCount = 0;
        let lateCount = 0;
        let noAnswerCount = 0;
        let yes = "";
        let late = "";
        let no = "";
        let noAnswer = "";

        let cursor = this.responses.find({ "pollid": name });
        while (cursor.hasNext) {
            let document = cursor.next();
            switch (document.answer) {
                case "yes":
                    yes += document.displayName + " " + document.message;
                    yes += "\n";
                    yesCount++;
                    break;
                case "late":
                    late += document.displayName + " " + document.message;
                    late += "\n";
                    lateCount++;
                    break;
                case "no":
                    no += document.displayName + " " + document.message;
                    no += "\n";
                    noCount++;
                    break;
                case "noanswer":
                    noAnswer += document.displayName;
                    noAnswer += "\n";
                    noAnswerCount++;
                    break;
            }
        }

        message += "__**Yes**__ - " + yesCount;
        message += "\n";
        message += yes;

        message += "__**Late**__ - " + lateCount;
        message += "\n";
        message += late;

        message += "__**No**__ - " + noCount;
        message += "\n";
        message += no;

        message += "__**No Answer**__ - " + noAnswerCount;
        message += "\n";
        message += noAnswer;

        return message;
    }
}