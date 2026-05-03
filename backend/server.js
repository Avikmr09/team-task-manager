const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables!');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit if we can't connect
  });
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve React app for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
