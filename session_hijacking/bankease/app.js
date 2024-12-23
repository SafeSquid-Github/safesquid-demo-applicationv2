const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3003;

// Database setup
const dbPath = process.env.DB || '/var/db/demo/bankease.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Create users table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      password TEXT NOT NULL
    )
  `);
});

// Middleware
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.cookies.email) {
    const email = req.cookies.email;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      if (user) {
        res.locals.user = user;
        next();
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.redirect('/login');
  }
}

// Routes

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      if (user) {
        res.cookie('email', email, {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    }
  );
});

// Dashboard route
app.get('/', isAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Login page route
app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Profile page route
app.get('/profile', isAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Update profile route
app.post('/profile', isAuthenticated, (req, res) => {
  const { name, email, mobile } = req.body;
  const { email: userEmail } = res.locals.user;

  db.run(
    `UPDATE users
     SET name = COALESCE(?, name),
         email = COALESCE(?, email),
         mobile = COALESCE(?, mobile)
     WHERE email = ?`,
    [name, email, mobile, userEmail],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      res.redirect('/profile');
    }
  );
});

// User profile API route
app.get('/user-profile', isAuthenticated, (_req, res) => {
  const { name, email, mobile } = res.locals.user;
  res.json({ name, email, mobile });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Bankease Server is listening on port ${PORT}`);
});