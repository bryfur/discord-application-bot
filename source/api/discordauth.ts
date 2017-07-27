import { Router } from "express";
import * as express from "express";
import * as fetch from "node-fetch";
import * as btoa from "btoa";
import * as cookieSession from "cookie-session";

import * as config from "../config";
import { catchAsync } from "../utils";

// Validate the user id with the discord api token
export async function IsUserAuthorized(token, id): Promise<boolean> {
    const response = await fetch("https://discordapp.com/api/users/@me",
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
        });
    const json = await response.json();
    if (json.id === id) {
        return true;
    } else {
        return false;
    }
}

export function discordauth(): Router {
    const app = express();

    const router = express.Router();

    const CLIENT_ID = config.CLIENT_ID;
    const CLIENT_SECRET = config.CLIENT_SECRET;
    const redirect = config.redirect;

    router.use(cookieSession({
        name: "session",
        keys: [config.token],
        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }));

    router.get("/login", (req, res) => {
        res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
    });

    router.get("/logout", catchAsync(async (req, res) => {
        req.session = undefined;
        res.redirect(`/`);
    }));

    router.get("/callback", catchAsync(async (req, res) => {
        if (!req.query.code) throw new Error("NoCodeProvided");
        const code = req.query.code;
        const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
        const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${creds}`,
                },
            });
        const json = await response.json();
        req.session.discordtoken = json.access_token;
        res.redirect(`/`);
    }));

    router.get("/user", catchAsync(async (req, res) => {
        console.log(req.session.discordtoken);
        const response = await fetch("https://discordapp.com/api/users/@me",
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.session.discordtoken
                },
            });
        const json = await response.json();
        console.log(json);
        res.json(json);
    }));

    return router;
}
