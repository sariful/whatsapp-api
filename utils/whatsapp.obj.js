const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { Client, MessageMedia } = require("whatsapp-web.js");

class WhatsApp {
    constructor(io) {
        this.io = io;
    }

    connect() {
        const self = this;
        self.io.on("connection", (socket) => {
            console.log(`user connected: ${socket.id}`);
            const jwt_secret = "hello";

            let sessionCfg;

            const token = socket.handshake.auth.jwt_token;
            if (token) {
                sessionCfg = jwt.verify(token, jwt_secret);
            }

            const whatsapp_client = new Client({
                qrTimeoutMs: 0,
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
                console.log("qr code generated of socket: " + socket.id);
                socket.emit("qr", qr);
            });


            whatsapp_client.on("ready", () => {
                console.log("Client is ready!");
                socket.emit("ready", "WhatsApp is ready to send or receive message");
            });

            whatsapp_client.on("authenticated", (session) => {
                console.log("Authenticated!");
                sessionCfg = session;

                const jwt_token = jwt.sign(session, jwt_secret);
                socket.emit("authenticated", jwt_token);
            });




            whatsapp_client.on("auth_failure", (data) => {
                console.log("AUTH Failed !", data);

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


            // whatsapp_client.initialize();
            whatsapp_client.initialize().catch(_ => _);


            socket.on("getContacts", async () => {
                const result = await whatsapp_client.getContacts();

                socket.emit("gotContacts", result);
            });


            socket.on("sendFile", async sendData => {
                if (sendData.number) {
                    const sanitized_number = sendData.number.toString().replace(/[- )(]/g, "");
                    const final_number = `91${sanitized_number.substring(sanitized_number.length - 10)}`;

                    const number_details = await whatsapp_client.getNumberId(final_number);

                    const media = MessageMedia.fromFilePath(path.resolve(sendData.file_path));

                    if (number_details) {
                        console.log(number_details._serialized);
                        const sendMessageData = await whatsapp_client.sendMessage(number_details._serialized, media, sendData.message);
                        const sendMessageData2 = await whatsapp_client.sendMessage(number_details._serialized, sendData.message);

                        fs.unlinkSync(sendData.file_path);

                        console.log(sendMessageData.id.id, sendMessageData2.id.id);
                        if (sendMessageData.id.id) {
                            socket.emit("message_sent", sendMessageData);
                        } else {
                            socket.emit("message_failed", sendMessageData);
                        }
                    } else {
                        console.log(final_number);
                    }
                }
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
                        if (sendMessageData.id.id) {
                            socket.emit("message_sent", sendMessageData);
                        } else {
                            socket.emit("message_failed", sendMessageData);
                        }
                    } else {
                        console.log(final_number);
                    }
                }
            });

            whatsapp_client.on("message_ack", (message) => {
                // console.log("Id ", message.id.id, ack);
                // console.log("Ack " + ack);

                socket.emit("message_ack", message.id);

            });

            socket.on("disconnect", function () {
                console.log("closing window in 10 second");
                setTimeout(() => {
                    whatsapp_client.destroy();
                    console.log("window closed: " + socket.id);
                }, 10000);
                console.log("User has disconnected: " + socket.id);
            });


            socket.on("logout", () => {
                whatsapp_client.logout();
            });
        });
    }
}

module.exports = WhatsApp;
