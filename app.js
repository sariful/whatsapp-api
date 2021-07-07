(function () {
    "use strict";
    // const createError = require("http-errors");
    const express = require("express");
    const path = require("path");
    const cookieParser = require("cookie-parser");
    const session = require("cookie-session");
    const { Client } = require("whatsapp-web.js");
    const jwt = require("jsonwebtoken");
    // const fs = require("fs");

    // initialize express server
    const app = express();
    const server = require("http").Server(app);


    const io = require("socket.io")(server, {
        cors: {
            origin: "*"
        }
    });



    const env = process.env.NODE_ENV || "development";
    global.config = require("./config/config.json")[env];

    /**
     * express server configuration
     */
    app.use(express.json({
        limit: "500mb"
    }));
    app.use(express.urlencoded({
        limit: "500mb",
        extended: false
    }));
    app.use(cookieParser());
    app.use(session({
        secret: "ssh"
    }));
    // static files server
    app.use(express.static(path.join(__dirname, "public")));

    // cors error
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, jwt-token");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        next();
    });

    /**
     * end express configs
     */




    /**
     * setup of socket io whatsapp api
     */
    io.on("connection", (socket) => {
        console.log(`user connected: ${socket.id}`);
        const jwt_secret = "hello";

        let sessionCfg;

        const token = socket.handshake.auth.jwt_token;
        if (token) {
            sessionCfg = jwt.verify(token, jwt_secret);
        }

        const whatsapp_client = new Client({
            puppeteer: {
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--unhandled-rejections=strict"
                ]
            },
            session: sessionCfg,
        });

        whatsapp_client.on("qr", qr => {
            console.log("qr code generated");
            socket.emit("qr", qr);
        });


        whatsapp_client.on("ready", () => {
            console.log("Client is ready!");
            socket.emit("ready", "Server is ready to send or receive message");
        });

        whatsapp_client.on("authenticated", (session) => {
            console.log("Authenticated!");
            sessionCfg = session;

            const jwt_token = jwt.sign(session, jwt_secret);
            socket.emit("authenticated", jwt_token);
        });




        whatsapp_client.on("auth_failure", () => {
            console.log("AUTH Failed !");

            socket.emit("auth_failure", "Authentication Failed");
        });


        whatsapp_client.on("change_state", state => {
            console.log("CHANGE STATE", state);

            socket.emit("change_state", state);
        });



        whatsapp_client.on("disconnected", (reason) => {
            console.log("Client was logged out", reason);
            sessionCfg = "";

            socket.emit("disconnected", reason);
        });


        whatsapp_client.on("message", msg => {
            if (msg.from != "status@broadcast") {
                console.log(msg.from, msg.body);

                socket.emit("message", msg);
            }
        });


        whatsapp_client.initialize();

        socket.on("getContacts", async () => {
            const result = await whatsapp_client.getContacts();

            socket.emit("gotContacts", result);
        });


        socket.on("message", async sendData => {
            if (sendData.number) {
                const sanitized_number = sendData.number.toString().replace(/[- )(]/g, "");
                const final_number = `91${sanitized_number.substring(sanitized_number.length - 10)}`;

                const number_details = await whatsapp_client.getNumberId(final_number);

                if (number_details) {
                    console.log(number_details._serialized);
                    const sendMessageData = await whatsapp_client.sendMessage(number_details._serialized, sendData.message);
                    console.log(sendMessageData.id.id);
                } else {
                    console.log(final_number);
                }
            }
        });

        whatsapp_client.on("message_ack", (message, ack) => {
            console.log("Id ", message.id.id);
            console.log("Ack " + ack);

            socket.emit("message_ack", message.id);

        });

        socket.on("disconnect", function () {
            whatsapp_client.destroy();
            console.log("User has disconnected: " + socket.id);
        });


        socket.on("logout", () => {
            whatsapp_client.logout();
        });
    });



    /**
     * end whatsapp api configs
     */



    /**
     * routing
     * // no routing required at this moment */
    app.get("/", (req, res) => {
        res.send({});
    });
    // api route
    const apiRouter = require("./routes/api");
    app.use("/api", apiRouter);


    /**
     * end routing
     */




    /**
     * error handler
     *

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    app.use(function (err, req, res) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render("error");
    });

    server.listen(5200, function () {
        console.log("listening on port: 5200");
    });
    /**
     * end error handler
     */
    module.exports = {
        server,
        app
    };
})();

