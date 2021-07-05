const fs = require("fs");

class WhatsApp {
    async getQr() {
        const data = await fs.readFileSync("./utils/last.qr", "utf8");
        // const data = global.qr;

        return data;
    }
}

module.exports = WhatsApp;
