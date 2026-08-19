// --- EXPRESS.JS SERVER ---
// This file uses the Express framework, which simplifies routing and file serving.
// Compare this with server-pure-node.js to see how much code Express saves us!

// 1. Import the Express library
// Express makes it much easier to build web servers in Node.js
const express = require('express');

// 2. Import the 'path' library (built into Node.js)
// We use this to properly find our HTML files on the computer
const path = require('path');

// 3. Create the Express App
// This 'app' object represents our web server
const app = express();

// 4. Define the PORT
// A port is like a specific door on your computer where the server listens for requests
const PORT = 3000;

// --- MIDDLEWARE ---
// Middleware are functions that run before our routes.

// This allows Express to read data sent from HTML forms (like our signup form)
app.use(express.urlencoded({ extended: true }));

// This tells Express to automatically serve any static files (HTML, CSS, JS, Images)
// that are located in the parent directory (which is where our index.html is).
app.use(express.static(path.join(__dirname, '../')));

// --- ROUTES ---
// Routes define what happens when a user visits a specific URL

// Route for handling the Signup Form submission (POST request)
app.post('/signup', (req, res) => {
    // req.body contains the data sent from the form
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    
    // For now, we'll just log it to the console to prove we received it
    console.log("--- New Signup Received! ---");
    console.log("Name:", firstName, lastName);
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password, "(In a real app, always hash passwords!)");
    
    // We must send a response back to the user, otherwise their browser will hang
    res.send(`<h1>Thanks for signing up, ${firstName}!</h1><a href="/">Go back home</a>`);
});

// --- START THE SERVER ---
// Tell our app to listen for incoming requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is running!`);
    console.log(`Visit http://localhost:${PORT} in your web browser.`);
});
