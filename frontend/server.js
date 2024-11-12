const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create a new Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Set up the MySQL connection
const db = mysql.createConnection({
  host: 'vultr-prod-524b3e4c-63eb-40d6-9583-d56b4edf368a-vultr-prod-7755.vultrdb.com',
  user: 'vultradmin',
  password: 'AVNS_MdiGSflFTd5HfQXTDuN',
  database: 'PortAlchemyDB',
  port: 16751,
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
  const query = 'INSERT INTO USERS VALUES (?, ?, ?);';

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
