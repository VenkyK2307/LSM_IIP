// stocks.js
const express = require('express');
const db = require('../db');
const { authenticate } = require('./auth');  // Import authenticate middleware
const router = express.Router();

// Add Stock to Portfolio
router.post('/add', authenticate, async (req, res) => {
    const { stock_name, quantity, avg_cost } = req.body;
    const userId = req.user.userId; // Extracted from JWT payload

    try {
        // Insert stock into the stocks table for this user
        const [result] = await db.execute(
            'INSERT INTO stocks (user_id, stock_name, quantity, avg_cost) VALUES (?, ?, ?, ?)',
            [userId, stock_name, quantity, avg_cost]
        );

        res.status(201).send({ message: 'Stock added successfully!', stockId: result.insertId });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Update Stock in Portfolio
router.put('/update/:id', authenticate, async (req, res) => {
    const stockId = req.params.id;
    const { stock_name, quantity, avg_cost } = req.body;
    const userId = req.user.userId;

    try {
        // Update stock in the portfolio for the given user
        const [result] = await db.execute(
            'UPDATE stocks SET stock_name = ?, quantity = ?, avg_cost = ? WHERE id = ? AND user_id = ?',
            [stock_name, quantity, avg_cost, stockId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Stock not found or unauthorized!' });
        }

        res.status(200).send({ message: 'Stock updated successfully!' });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Delete Stock from Portfolio
router.delete('/delete/:id', authenticate, async (req, res) => {
    const stockId = req.params.id;
    const userId = req.user.userId;

    try {
        // Delete stock from the portfolio for the given user
        const [result] = await db.execute(
            'DELETE FROM stocks WHERE id = ? AND user_id = ?',
            [stockId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Stock not found or unauthorized!' });
        }

        res.status(200).send({ message: 'Stock deleted successfully!' });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Get User Portfolio
router.get('/portfolio', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get stocks for the user
        const [stocks] = await db.execute('SELECT * FROM stocks WHERE user_id = ?', [userId]);

        res.status(200).send(stocks);
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

module.exports = router;