const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3004;

// Log to console
app.use(morgan('combined'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});