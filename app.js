(function () {
    "use strict";
    // const createError = require("http-errors");
    const express = require("express");
    const path = require("path");
    const cookieParser = require("cookie-parser");
    const session = require("cookie-session");
    const whatsappObj = require("./utils/whatsapp.obj");
    // const fs = require("fs");

    // initialize express server
    const app = express();
    const server = require("http").Server(app);


    const io = require("socket.io")(server, {
        cors: {
            origin: "*"
        }
    });

    const whatsapp = new whatsappObj(io);
    whatsapp.connect();




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

