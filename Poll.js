"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Poll {
    constructor(name, question, users, validresponses, db) {
        this.polls = db.collection("polls");
        this.users = db.collection("users");
        this.polls.insertOne({ "_id": name,
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
exports.Poll = Poll;
//# sourceMappingURL=Poll.js.map