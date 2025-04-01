// XMLHttpRequest to fetch JSON data
const xmlhttp = new XMLHttpRequest();

xmlhttp.onload = function () {
    let jsonData = JSON.parse(this.responseText);

    // Debug: Log the raw JSON data to inspect its structure
    // console.log("JSON Data:", jsonData);

    // Add sessionId to each item by extracting it from the query
    jsonData.forEach(function (item) {
        item.sessionId = extractSessionId(item.query); // Extract sessionId from query
        if (!item.sessionId) {
            console.warn("Failed to extract sessionId for item:", item);
        }
        let data = item.query.replace(".swgaudit.com", ""); // Remove ".swgaudit.com"

        // Remove sessionId and chunk number part from the subdomain (if any)
        item.data = data.replace(/^[a-zA-Z0-9\-]+\.\d+\./, ""); // Remove sessionId and chunk

        item.chunkIndex = data.match(/(\d+)\.(\d+)\./)?.[2];
    });

    // Group the data by sessionId
    let groupedData = groupDataBySessionId(jsonData);

    // Debug: Log the grouped data
    // console.log("Grouped Data by sessionId:", groupedData);

    // Get a reference to the container where the session boxes will be displayed
    var container = document.getElementById("sessionContainer");

    // Loop through each sessionId and create a box for each
    Object.keys(groupedData).forEach(function (sessionId) {
        let sessionData = groupedData[sessionId];

        // Sort session data explicitly by chunkIndex
        sessionData.sort(function (a, b) {
            return a.chunkIndex - b.chunkIndex; // Sort in ascending order of chunkIndex
        });

        // Debug: Log sorted session data for this sessionId
        // console.log(`Sorted Data for Session ${sessionId}:`, sessionData);

        // Create a new container (box) for the sessionId
        var sessionBox = document.createElement('div');
        sessionBox.classList.add('session-box');

        // Create a title for the session box
        var sessionTitle = document.createElement('h3');
        sessionTitle.textContent = `Session ID: ${sessionId}`;
        sessionBox.appendChild(sessionTitle);

        // Group all the decoded queries for this sessionId
        var fullSessionQuery = rebuildSessionQuery(sessionData);

        // Create a textarea or div to display the concatenated decoded queries
        var queryBox = document.createElement('textarea');
        queryBox.textContent = fullSessionQuery; // Add the decoded content for the session

        // Optionally, you can add some styles to make it look better
        queryBox.style.width = "100%";
        queryBox.style.height = "150px";

        sessionBox.appendChild(queryBox);

        // Append the session box to the main container
        container.appendChild(sessionBox);
    });
};


xmlhttp.open("GET", "/api/sessions");
xmlhttp.send();

// Helper function to extract sessionId from query
function extractSessionId(query) {
    // Use regex to extract sessionId (e.g., extract "abc123" from "abc123.1.somequery.swgaudit.com")
    // console.log(query);
    let match = query.match(/^([a-zA-Z0-9\-]+)\./);
    return match ? match[1] : null; // Return sessionId or null if not found
}

// Helper function to group data by sessionId
function groupDataBySessionId(data) {
    let groupedData = {};

    data.forEach(function (item) {
        if (!groupedData[item.sessionId]) {
            groupedData[item.sessionId] = [];
        }
        groupedData[item.sessionId].push(item);
    });

    return groupedData;
}

// Helper function to rebuild the full query from chunks for a given sessionId
function rebuildSessionQuery(sessionData) {
    // Ensure the session data is sorted by chunkIndex in ascending order
    sessionData.sort(function (a, b) {
        return a.chunkIndex - b.chunkIndex; // Sort by chunkIndex
    });

    // Debug: Log the sorted session data
    // console.log("Rebuilding query with sorted chunks:", sessionData);
    
    // Rebuild the full query by concatenating the chunks, removing sessionId and chunk number
    var assembled = sessionData.map(function (item) {
        return item.data
    }).join(''); // Use a space or newline as needed

    // console.log("Assembled chunks:", assembled);
    
    var decoded = decoded_string(assembled);
    return decoded;
}

// Function to decode Base32
function decoded_string(encoded_query) {
    // console.log("Decoding input:", encoded_query);
    try {
        const decoded = base32Decode(encoded_query); // Decodes to Uint8Array
        const textDecoder = new TextDecoder(); // Converts Uint8Array to string
        const decodedString = textDecoder.decode(decoded);
        // console.log("Decoded result:", decodedString);
        return decodedString;
    } catch (error) {
        console.error("Decoding failed for:", encoded_query, "Error:", error.message);
        return "Decoding Error"; // Return a placeholder if decoding fails
    }
}

// Base32 decoding function
function base32Decode(input) {
    const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';
    const charMap = {};
    for (let i = 0; i < base32Chars.length; i++) {
        charMap[base32Chars[i]] = i;
    }

    let result = [];
    let buffer = 0;
    let bufferLength = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '=') {
            continue; // Skip padding characters
        }

        if (!(char in charMap)) {
            throw new Error(`Invalid character in input: ${char}`);
        }

        const bits = charMap[char];
        buffer <<= 5;
        buffer |= bits;
        bufferLength += 5;

        if (bufferLength >= 8) {
            result.push((buffer >> (bufferLength - 8)) & 255);
            bufferLength -= 8;
        }
    }

    return new Uint8Array(result);
}
