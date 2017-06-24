import { Collection, MongoClient, Db } from "mongodb";
import { TextChannel, Message, Role, GuildMember } from "discord.js";

export class Poll {
    private _name: string;
    private _question: string;
    private _role: Role;
    private _answers: string[];
    private _outputChannel: TextChannel;

    private _polls: Collection;
    private _responses: Collection;

    private _header: string;
    private _reportMessage: Message | Message[];

    constructor(name: string, question: string, answers: string[], role: Role, outputChannel: TextChannel, db: Db) {

        this._name = name;
        this._question = question;
        this._answers = answers;
        this._role = role;
        this._outputChannel = outputChannel;
        this._polls = db.collection("polls");
        this._responses = db.collection("responses");

        this._header = "__***" + this._name + new Date().toLocaleDateString +
                                 "***__\n **" + this._question + "**\n";

        this._polls.insertOne(
            { "_id": name,
              "question": question,
              "answers": answers,
              "role": role.id
            });

        // this is probably really shit way to do this
        this._role.members.forEach(member => {
            this._responses.insertOne({
                "memberid": member.id,
                "pollid": name,
                "displayname": member.displayName,
                "answer": "noanswer",
                "message": ""
            });
        });
    }

    start() {

        this._outputChannel.send(this.GetMessage()).then((message => {
            this._reportMessage = message;
        }));
    }

    Respond(member: GuildMember, message: Message, tokens: string[]) {

        if (!member.roles.exists("id", this._role.id)) {
            return;
        }

        this._responses.update({ "memberid": member.id, "pollid": name },
            {
                "memberid": member.id,
                "pollid": name,
                "displayname": member.displayName,
                "answer": tokens[1],
                "message": tokens[2]
            },
            { upsert: true }
        );

        (<Message>this._reportMessage).edit(this.GetMessage());
    }

    private GetMessage(): string {

        let message = this._header;
        const numAnswers = this._answers.length;

        const responses: Array<string> = new Array<string>(numAnswers);
        const counts: Array<number> = new Array<number>(numAnswers);

        let noAnswer = "";
        let noAnswerCount = 0;

        // tslint:disable-next-line:no-var-keyword
        var cursor = this._responses.find({ "pollid": name });
        while (cursor.hasNext) {
            const document = cursor.next();
            for (let i = 0; i < numAnswers; i++) {
                if (document.answer === this._answers[i].toLowerCase()) {
                    counts[i]++;
                    responses[i] += document.displayName + " " + document.message;
                    responses[i] += "\n";
                } else {
                    noAnswer += document.displayName;
                    noAnswer += "\n";
                    noAnswerCount++;
                }
            }
        }

        for (let i = 0; i < numAnswers; i++) {
            message += "__**" + this._answers[i] + "**__ - " + counts[i];
            message += "\n";
            message += responses[i];
        }

        message += "__**No Answer**__ - " + noAnswerCount;
        message += "\n";
        message += noAnswer;

        return message;
    }
}