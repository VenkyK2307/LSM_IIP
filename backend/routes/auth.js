const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); // Google OAuth Client
require('dotenv').config();
const db = require('../db'); // Your database connection
const router = express.Router();

// Initialize Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticate = (req, res, next) => {
    // Retrieve the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ error: 'Authentication required' });
    }

    try {
        // Verify the token and decode the payload
        // Attach the decoded user information to the request object
        req.user = jwt.verify(token, process.env.JWT_SECRET);

        // Call the next middleware/route handler
        next();
    } catch (err) {
        res.status(401).send({ error: 'Invalid or expired token' });
    }
};

// Helper function for email validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// Registration Endpoint
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    // Manually handle validations
    if (!email || !validateEmail(email)) {
        return res.status(400).send({ error: 'Enter a valid email address' });
    }
    if (!password || password.length < 6) {
        return res.status(400).send({ error: 'Password must be at least 6 characters long' });
    }
    if (!username || username.trim() === '') {
        return res.status(400).send({ error: 'Username cannot be empty' });
    }

    try {
        // Check if the email already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send({ error: 'Email already in use!' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
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

// Login Endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).send({ error: 'Enter a valid email address' });
    }
    if (!password) {
        return res.status(400).send({ error: 'Password is required' });
    }

    try {
        // Find the user by email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).send({ error: 'User not found!' });
        }
        const user = rows[0];

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials!' });
        }

        // Create a JWT token for the authenticated user
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        res.status(200).send({ message: 'Login successful!', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ error: 'Server error during login' });
    }
});

// Google Login Endpoint
router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;

    try {
        // Verify the Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Check if the user already exists in the database
        const [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;
        if (userRows.length === 0) {
            // If the user does not exist, create a new user
            const [result] = await db.execute(
                'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
                [email, payload.name, null] // Insert null for password
            );
            user = { id: result.insertId, email, username: payload.name };
        } else {
            user = userRows[0];
        }

        // Create a JWT token for the user
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        res.status(200).send({ message: 'Google login successful!', token });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).send({ error: 'Google login failed' });
    }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).send({ error: 'Enter a valid email address' });
    }

    try {
        const [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.status(400).send({ error: 'No user found with that email!' });
        }

        // Here, you would send an email with a password reset link
        // This part is omitted for simplicity, but you can use nodemailer to send emails.

        res.status(200).send({ message: 'Password reset email sent.' });
    } catch (err) {
        console.error('Error in forgot password:', err);
        res.status(500).send({ error: 'Server error during password reset' });
    }
});

module.exports = {router, authenticate};