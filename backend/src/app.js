const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const churchRoutes = require('./routes/churchRoutes');
const consentRoutes = require('./routes/consentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS * 60 * 1000 || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/church', churchRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;