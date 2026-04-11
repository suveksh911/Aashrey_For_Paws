require('dotenv').config();
const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Configuration
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,                  
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/auth', limiter); 

// Middleware Setup
app.use(cors({ origin: config.frontendUrl || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Basic health check
app.get('/', (req, res) => {
  res.send('Aashrey For Paws Backend is running 🐾');
});

// API Routing
app.use('/api/auth', require('./routes/AuthRouter'));
app.use('/api/pets', require('./routes/PetRouter'));
app.use('/api/posts', require('./routes/PostRouter'));
app.use('/api/contact', require('./routes/ContactRouter'));
app.use('/api/admin', require('./routes/AdminRouter'));
app.use('/api/adoptions', require('./routes/AdoptionRouter'));
app.use('/api/vaccinations', require('./routes/VaccinationRouter'));
app.use('/api/users', require('./routes/UserRouter'));
app.use('/api/notifications', require('./routes/NotificationRouter'));
app.use('/api/reviews', require('./routes/ReviewRouter'));
app.use('/api/feedback', require('./routes/FeedbackRouter'));
app.use('/api/campaigns', require('./routes/CampaignRouter'));
app.use('/api/ngo', require('./routes/NgoRouter'));
app.use('/api/payment', require('./routes/PaymentRouter'));

// Generic error handling
app.use((err, req, res, next) => {
  console.log('Error caught in app handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

module.exports = app;


