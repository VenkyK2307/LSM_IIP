const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Import authentication routes
const stocksRoutes = require('./routes/stocks');  // Import stock routes

// Create a new Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use the routes for handling specific API paths
app.use('/auth', authRoutes.router);   // Mount the authentication routes
app.use('/stocks', stocksRoutes);  // Make sure this is correctly set

// Start the server
const startServer = () => {
  const PORT = 8000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// Start the server
startServer();