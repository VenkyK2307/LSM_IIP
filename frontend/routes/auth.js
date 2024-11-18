const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables from the .env file
const db = require('../db');
const router = express.Router();

// Ensure JWT_SECRET is loaded from environment
if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET is missing in .env file');
    process.exit(1); // Exit the process if the secret is missing
}

// User Registration
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if email already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send({ error: 'Email already in use!' });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const [result] = await db.execute(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            [email, username, hashedPassword]
        );

        res.status(201).send({ message: 'User registered successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send({ error: 'Server error during registration' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists by email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).send({ error: 'User not found!' });
        }

        const user = rows[0];

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY}
        );

        res.status(200).send({ message: 'Login successful!', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ error: 'Server error during login' });
    }
});

// Middleware to authenticate JWT token
function authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ error: 'Access denied, token is required' });
    }

    try {
        // Verify the JWT token using the secret
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(400).send({ error: 'Invalid or expired token' });
    }
}

module.exports = { router, authenticate };