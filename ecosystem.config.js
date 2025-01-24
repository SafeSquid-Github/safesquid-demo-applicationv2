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
                DB: '../../databases/phish.db',
                DOMAIN: 'iciciibank.com',
                SUBDOMAIN: 'infinity',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3001,
                DB: '../../databases/phish.db',
                DOMAIN: 'iciciibank.com',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "icicibank",
            tag: "Phishing Lure",
            namespace: "phishing",
            cwd: "./phishing/icicibank",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3009,
                DB: '../../databases/phish.db',
                DOMAIN: 'icicibank.com',
                SUBDOMAIN: 'infinity',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3009,
                DB: '../../databases/phish.db',
                DOMAIN: 'icicibank.com',
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
                DB: '../../databases/phish.db',
                DOMAIN: 'infoman.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3002,
                DB: '../../databases/phish.db',
                DOMAIN: 'infoman.com',
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
                DB: '../../databases/bankease.db',
                DOMAIN: 'bankease.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3003,
                DB: '../../databases/bankease.db',
                DOMAIN: 'bankease.com',
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
                DOMAIN: 'technews.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3004,
                DOMAIN: 'technews.com',
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
                DOMAIN: 'biznews.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3005,
                DOMAIN: 'biznews.com',
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
                DOMAIN: 'xn--microsof-epb.com',
                SUBDOMAIN: 'copilot',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3006,
                TYPE: 'eicar',
                FRAGMENTS_COUNT: 7,
                DOMAIN: 'xn--microsof-epb.com',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "swgaudit",
            tag: "DNS Tunneling",
            namespace: "dns_tunneling",
            cwd: "./dns_tunneling/swgaudit",
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
                DOMAIN: 'swgaudit.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3007,
                DNS_LOG_FILE: "/var/log/named/query.log",
                DOMAIN: 'swgaudit.com',
            },
            pre_start: "mkdir -p logs && npm install",
        },
        {
            name: "dnscapturestore",
            tag: "DNS Tunneling",
            namespace: "dns_tunneling",
            cwd: "./dns_tunneling/store",
            script: "./app.js",
            out_file: "./logs/out.log", // Standard output
            error_file: "./logs/error.log", // Error logs
            log_file: "./logs/combined.log", // Combined logs
            merge_logs: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "logs"],
            env_development: { // Explicitly define the `development` environment
                NODE_ENV: "development",
                PORT: 3008,
                DNS_LOG_FILE: "/var/log/named/query.log",
                DOMAIN: 'dnsstore.com',
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3008,
                DNS_LOG_FILE: "/var/log/named/query.log",
                DOMAIN: 'dnsstore.com',
            },
            pre_start: "mkdir -p logs && npm install",
        },
    ],
};