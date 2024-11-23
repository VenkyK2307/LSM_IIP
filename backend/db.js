const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables from .env file

// Set up the MySQL connection using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 30000
});

// Promise wrapper for easier async/await usage
const db = pool.promise();

// Check the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);  // Exit the application if the DB connection fails
    }
    console.log('Connected to the MySQL database');
    connection.release(); // Release the connection after checking
});

module.exports = db;