const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3007;

// Log to console
app.use(morgan("combined"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path to the BIND9 log file
const logFilePath = process.env.DNS_LOG_FILE || "/var/log/named/query.log";

const upload = multer({ dest: path.join(__dirname, "uploads") });

// Function to read and parse the log file
function parseLogFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    console.log(fileContent);

    const regexPattern =
      /^(\d{2}-\w{3}-\d{4})\s(\d{2}:\d{2}:\d{2}\.\d+)\s.*client\s@[\w]+\s([\d\.]+)#\d+\s\(([\w\.\-]+\.swgaudit\.com)\):\squery:\s([\w\.\-]+\.swgaudit\.com).*IN\s(A)\s.*\(([\d\.]+)\)/;

    const logEntries = fileContent
      .split("\n")
      .filter((line) => regexPattern.test(line))
      .map((line) => {
        const match = line.match(regexPattern);

        if (match) {
          console.log(match);
          return {
            date: match[1],
            time: match[2],
            clientIp: match[3],
            query: match[4]
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries

    return logEntries;
  } catch (err) {
    console.error("Error reading or parsing log file:", err.message);
    return [];
  }
}

// Routes
// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/upload", upload.single("filename"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  } else {
    return res.status(200).send("File upload successful");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});