require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/uploadRoutes');
const policyRoutes = require('./routes/policyRoutes');

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.ngrok-free.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start Server after database connection
const startServer = async () => {
  try {
    // 9. server.js MUST start with db.js connection before routes mount
    await connectDB();

    // Mount Routes
    app.use('/api/upload', uploadRoutes);
    app.use('/api/policy', policyRoutes);

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🎯`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
