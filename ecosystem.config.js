module.exports = {
    apps: [
        {
            name: "iciciibank",
            tag: "Phishing Lure",
            namespace: "phishing",
            cwd: "./phishing/iciciibank",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3001,
                DB: './databases/phish.db',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3001,
                DB: './databases/phish.db',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "infoman",
            tag: "Credential Store",
            namespace: "phishing",
            cwd: "./phishing/infoman",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3002,
                DB: './databases/phish.db',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3002,
                DB: './databases/phish.db',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "bankease",
            tag: "CSRF Target",
            namespace: "session_hijacking",
            cwd: "./session_hijacking/bankease",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3003,
                DB: './databases/bankease.db',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3003,
                DB: './databases/bankease.db',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "technews",
            tag: "XSS Vulnerable App",
            namespace: "session_hijacking",
            cwd: "./session_hijacking/technews",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3004,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3004,
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "biznews",
            tag: "Malware Ad Site",
            namespace: "driveby_malware",
            cwd: "./driveby_malware/ad_site",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3005,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3005,
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "downloadsite",
            tag: "Drive-By Download Site",
            namespace: "driveby_malware",
            cwd: "./driveby_malware/download_site",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs", "payload"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3006,
                TYPE: 'eicar',
                FRAGMENTS_COUNT: 7,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3006,
                TYPE: 'eicar',
                FRAGMENTS_COUNT: 7,
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "swgaudit",
            tag: "DNS Tunneling",
            namespace: "dns_tunneling",
            cwd: "./dns_tunneling",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3007,
                DNS_LOG_FILE: "/var/log/named/query.log",
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3007,
                DNS_LOG_FILE: "/var/log/named/query.log",
            },
            pre_start: "mkdir -p logs && npm install",
        },
    ],
};