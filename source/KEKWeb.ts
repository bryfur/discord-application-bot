import * as express from "express";
import * as http from "http";
import * as cookieSession from "cookie-session";
import * as bodyParser from "body-parser";
import { Db } from "mongodb";
import { Client } from "discord.js";

import * as config from "./config";
import { discordauth } from "./api/discordauth";
import { application } from "./api/application";

export function Start(client: Client, db: Db) {
    const app = express();
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static("public"));

    app.use("/api/discordauth", discordauth());
    app.use("/api/application", application(db, client));

    app.use(cookieSession({
        name: "session",
        keys: [config.key],
        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }));
    app.get("/*", function (req, res) {
        res.sendFile(__dirname + "/public/index.html");
    });

    /**
     * Get port from environment and store in Express.
     */
    const port = normalizePort(config.port);
    app.set("port", port);

    app.use((err, req, res, next) => {
        switch (err.message) {
            case "NoCodeProvided":
                return res.status(400).send({
                    status: "ERROR",
                    error: err.message,
                });
            default:
                return res.status(500).send({
                    status: "ERROR",
                    error: err.message,
                });
        }
    });

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    /**
     * Normalize a port into a number, string, or false.
     */
    function normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== "listen") {
            throw error;
        }
        const bind = typeof port === "string"
            ? "Pipe " + port
            : "Port " + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        const addr = server.address();
        const bind = typeof addr === "string"
            ? "pipe " + addr
            : "port " + addr.port;
        console.log("Listening on " + bind);
    }
}
