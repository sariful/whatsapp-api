(function () {
    "use strict";
    const createError = require('http-errors');
    const express = require('express');
    const path = require('path');
    const cookieParser = require('cookie-parser');


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
    // static files server
    app.use(express.static(path.join(__dirname, 'public')));
    /**
     * end express configs
     */



    /**
     * routing
     */
    app.get("/", (req, res) => {
        res.send({});
    });
    // api route
    const apiRouter = require('./routes/api');
    app.use('/api', apiRouter);


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

    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    module.exports = app;
})();

