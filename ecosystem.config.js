module.exports = {
    apps: [{
        name: "whatsapp_api",
        script: "npm start",
        watch: true,
        ignore_watch: ["node_modules", "./uploads"],
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        error_file: "../whatsapp_api_err.log",
        out_file: "../whatsapp_api_out.log",
        log_file: "../whatsapp_api_combined.log",
        time: true
    }]
};
