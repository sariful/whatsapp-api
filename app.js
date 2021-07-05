(function () {
    "use strict";
    const createError = require("http-errors");
    const express = require("express");
    const path = require("path");
    const cookieParser = require("cookie-parser");
    const session = require("cookie-session");
    // const { Client } = require("whatsapp-web.js");
    // const fs = require("fs");

    // initialize express server
    const app = express();


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
     * whatsapp api configs
     *
    const SESSION_FILE_PATH = "../session.json";
    let sessionCfg;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionCfg = require(SESSION_FILE_PATH);
    } else {
        console.log("no session file found");
    }

    console.log(sessionCfg);

    global.client = new Client({
        puppeteer: {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--unhandled-rejections=strict"
            ]
        },
        session: sessionCfg
    });
    global.isAuthenticated = false;

    client.on("qr", qr => {
        console.log("qr code generated");
        global.qr = qr;
        fs.writeFileSync("./utils/last.qr", qr);
    });



    client.on("ready", () => {
        console.log("Client is ready!");
    });


    client.on("authenticated", (session) => {
        console.log("AUTH!", { session });
        sessionCfg = session;

        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            }
            isAuthenticated = true;
        });

        try {
            fs.unlinkSync("./utils/last.qr");
        } catch (err) {
            //
        }
    });


    client.on("auth_failure", () => {
        console.log("AUTH Failed !");
        sessionCfg = "";
        fs.unlinkSync("../session.json");

        process.exit();
    });


    client.on("change_state", state => {
        console.log("CHANGE STATE", state);
    });



    client.on("disconnected", (reason) => {
        console.log("Client was logged out", reason);
        sessionCfg = "";
        fs.unlinkSync("../session.json");

    });


    client.on("message", msg => {
        console.log(msg);
        if (config.webhook.enabled) {
            // axios.post(config.webhook.path, { msg });
        }
    });


    client.initialize();

    /**
     * end whatsapp api configs
     */



    /**
     * routing
     */
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
     */

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

    module.exports = app;
})();

