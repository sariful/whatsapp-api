const express = require("express");
const multer = require("multer");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync("../uploads")){
            fs.mkdirSync("../uploads");
        }
        cb(null, "../uploads");
    },
    filename: function (req, file, cb) {
        cb(null, moment().format("YYYY-MM-DD-hms") + "-" + file.originalname);
    }
});


const upload = multer({
    storage: storage
});


router.route("/upload-invoice")
    .post(upload.single("file"), async (req, res) => {

        const location = path.resolve(req.file.path);
        const url = path.normalize(req.file.path);
        res.send({
            status: "success",
            location,
            url
        });

    });


module.exports = router;
