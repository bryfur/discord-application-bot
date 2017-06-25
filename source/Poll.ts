import { Collection, MongoClient, Db } from "mongodb";
import { TextChannel, Message, Role, GuildMember } from "discord.js";

export async function PollFactory(name: string, question: string, answers: string[], role: Role, outputChannel: TextChannel, db: Db, recovery = false): Promise<Poll> {
    let polls = db.collection("polls");
    let responses = db.collection("responses");

    if (!recovery) {
        await polls.insertOne(
            {
                "_id": name,
                "question": question,
                "answers": answers,
                "role": role.id,
                "outputChannelid": outputChannel.id,
                "messageid": ""
            });

        await Promise.all(
            role.members.map(member => responses.insertOne(
                {
                    "memberid": member.id,
                    "pollid": name,
                    "displayname": member.displayName,
                    "answer": "noanswer",
                    "message": ""
                })
            )
        );
    }
    return new Poll(name, question, answers, role, outputChannel, db);
}

export class Poll {
    private _name: string;
    private _question: string;
    private _role: Role;
    private _answers: string[];
    private _outputChannel: TextChannel;

    private _polls: Collection;
    private _responses: Collection;

    private _header: string;
    private _reportMessage: Message;

    constructor(name: string, question: string, answers: string[], role: Role, outputChannel: TextChannel, db: Db) {
        this._name = name;
        this._question = question;
        this._answers = answers;
        this._role = role;
        this._outputChannel = outputChannel;
        this._polls = db.collection("polls");
        this._responses = db.collection("responses");

        this._header = "__***" + this._name + " " + new Date().toLocaleDateString() +
            "***__\n **" + this._question + "**\n";
    }

    async start() {
        const message = await this._outputChannel.send(await this.GetMessage());

        this._reportMessage = <Message>message;

        await this._responses.update({ "_id": this._name },
            {
                "messageid": this._reportMessage.id
            }
        );

        await Promise.all(this._role.members.map(
            member => {
                member.send(this._question);
            })
        );
    }

    async Respond(member: GuildMember, message: Message, tokens: string[]): Promise<boolean> {
        if (!member.roles.exists("id", this._role.id)) {
            return;
        }

        await this._responses.updateOne({ "memberid": member.id, "pollid": name },
            {
                "memberid": member.id,
                "pollid": name,
                "displayname": member.displayName,
                "answer": tokens[1],
                "message": tokens[2]
            },
            { upsert: true }
        );

        await (<Message>this._reportMessage).edit(await this.GetMessage());

        return true;
    }

    private async GetMessage(): Promise<string> {
        let message = this._header;
        const numAnswers = this._answers.length;

        const responses: Array<string> = new Array<string>(numAnswers);
        responses.forEach(resp => resp = "");
        const counts: Array<number> = new Array<number>(numAnswers);
        counts.forEach(i => i = 0);

        let noAnswer = "";
        let noAnswerCount = 0;

        // tslint:disable-next-line:no-var-keyword
        var cursor = this._responses.find({ "pollid": this._name });
        const documents = await cursor.toArray();

        if (documents) {
            documents.forEach(document => {
                let answered = false;
                for (let i = 0; i < numAnswers; i++) {
                    if (document.answer === this._answers[i].toLowerCase()) {
                        counts[i]++;
                        responses[i] += document.displayname + " " + document.message;
                        responses[i] += "\n";
                        answered = true;
                    }
                }
                if (!answered) {
                    noAnswer += document.displayname;
                    noAnswer += "\n";
                    noAnswerCount++;
                }
            });
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