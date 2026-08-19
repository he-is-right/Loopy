// --- PURE NODE.JS SERVER (NO EXPRESS) ---
// This file demonstrates how much more work it takes to build a server without Express.
// We have to handle routing, serving files, parsing data, and content types manually.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Create the server
const server = http.createServer((req, res) => {
    
    // 1. ROUTING: Check if the request is a POST request to the /signup URL
    if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
        
        // Data comes in pieces (chunks) over the network, so we have to collect it
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        // Once all data is collected, we can parse and use it
        req.on('end', () => {
            // The body looks like text: firstName=Jane&lastName=Doe&username=jdoe...
            // URLSearchParams helps us easily extract the values
            const parsedBody = new URLSearchParams(body);
            
            const firstName = parsedBody.get('firstName');
            const lastName = parsedBody.get('lastName');
            const username = parsedBody.get('username');
            const email = parsedBody.get('email');
            const password = parsedBody.get('password');
            
            console.log("--- New Signup Received (Pure Node)! ---");
            console.log("Name:", firstName, lastName);
            console.log("Username:", username);
            console.log("Email:", email);
            console.log("Password:", password, "(In a real app, always hash passwords!)");
            
            // Send the HTML response back to the user
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>Thanks for signing up, ${firstName}!</h1><a href="/">Go back home</a>`);
        });
        
        return; // Stop execution here so we don't accidentally try to serve a file below
    }

    // 2. SERVING STATIC FILES (HTML, CSS)
    // We have to manually figure out which file the user wants based on the URL
    let filePath = path.join(__dirname, '../', req.url === '/' ? 'index.html' : req.url);
    
    // We also have to manually tell the browser what type of file we are sending (Content-Type)
    let extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.css') {
        contentType = 'text/css';
    }
    
    // Read the file from the hard drive
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // If there's an error (like the file doesn't exist)
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success! Send the file content to the browser
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Pure Node.js Server is running!`);
    console.log(`Visit http://localhost:${PORT} in your web browser.`);
});
