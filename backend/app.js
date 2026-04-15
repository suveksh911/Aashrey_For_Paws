const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/auth', limiter);

app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Aashrey For Paws Backend is running 🐾');
});

app.use('/api/auth', require('./routes/AuthRouter'));
app.use('/api/pets', require('./routes/PetRouter'));
app.use('/api/posts', require('./routes/PostRouter'));
app.use('/api/contact', require('./routes/ContactRouter'));
app.use('/api/admin', require('./routes/AdminRouter'));
app.use('/api/adoptions', require('./routes/AdoptionRouter'));
app.use('/api/vaccinations', require('./routes/VaccinationRouter'));
app.use('/api/users', require('./routes/UserRouter')); //need to change
app.use('/api/notifications', require('./routes/NotificationRouter'));
app.use('/api/reviews', require('./routes/ReviewRouter'));
app.use('/api/feedback', require('./routes/FeedbackRouter'));
app.use('/api/campaigns', require('./routes/CampaignRouter'));
app.use('/api/ngo', require('./routes/NgoRouter'));
app.use('/api/payment', require('./routes/PaymentRouter'));
app.use('/api/settings', require('./routes/SettingRouter'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;