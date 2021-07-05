const express = require("express");
const { Client } = require("whatsapp-web.js");
const WhatsAppObj = require("../utils/whatsapp.obj");
const router = express.Router();

/* GET home page. */
router.route("/get-qr").get(async (req, res) => {
    const whatsapp = new WhatsAppObj();

    const data = await whatsapp.getQr();

    res.send({
        status: "ok",
        data
    });

});

router.route("/new-login").get((req, res) => {
    let qrcode = "";
    const client = new Client({
        puppeteer: {
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--unhandled-rejections=strict"
            ]
        },
        session: req.session.whatsappSession,
    });

    client.on("qr", qr => {
        console.log("qr code generated");
        qrcode = qr;
    });


    client.on("ready", () => {
        console.log("Client is ready!");
    });

    client.on("authenticated", (session) => {
        console.log("AUTH!", { session });
        req.session.whatsappSession = session;
    });




    client.on("auth_failure", () => {
        console.log("AUTH Failed !");

        req.session.whatsappSession = "";
        process.exit();
    });


    client.on("change_state", state => {
        console.log("CHANGE STATE", state);
    });



    client.on("disconnected", (reason) => {
        console.log("Client was logged out", reason);
        req.session.whatsappSession = "";
    });


    client.on("message", msg => {
        console.log(msg);
        if (config.webhook.enabled) {
            // axios.post(config.webhook.path, { msg });
        }
    });


    client.initialize();

    // wait for sending message

    res.send({
        data: qrcode
    });

    // client
    //
    // new Client();
    //
});

router.route("/send-message").get((req, res) => {
    console.log(req.session.whatsappSession);
    // const client = new Client({
    //     puppeteer: {
    //         headless: false,
    //         args: [
    //             "--no-sandbox",
    //             "--disable-setuid-sandbox",
    //             "--unhandled-rejections=strict"
    //         ]
    //     },
    //     session: req.session.whatsappSession,
    // });
    // client.initialize();
    // client.sendMessage();
    res.send({
        status: "ok",

    });
});

module.exports = router;
