const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Create a new Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Set up the MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 30000
});

// Check MySQL connection when the server starts
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process if there is a connection error
  } else {
    console.log('Connected to the MySQL database!');
  }
});

// POST route to check if the user exists in the database
app.post('/check-user', (req, res) => {
  const { email } = req.body;

  // SQL query to check if the user already exists based on email
  const query = 'SELECT * FROM USERS WHERE email = ?;';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length > 0) {
      // User exists, return their data
      res.status(200).json({ exists: true, user: results[0] });
    } else {
      // User does not exist
      res.status(200).json({ exists: false });
    }
  });
});

// POST route to save a new user in the database
app.post('/save-user', (req, res) => {
  const { first_name, last_name, email } = req.body;

  // SQL query to insert a new user
  const query = 'INSERT INTO USERS (first_name, last_name, email) VALUES (?, ?, ?);';

  db.query(query, [first_name, last_name, email], (err, results) => {
    if (err) {
      console.error('Failed to insert user data:', err);
      return res.status(500).json({ error: 'Failed to insert user data' });
    }

    // Return success message and the newly inserted user's ID
    res.status(200).json({ message: 'User saved successfully', userId: results.insertId });
  });
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
